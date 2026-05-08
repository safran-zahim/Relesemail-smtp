import { google } from 'googleapis';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const config = {
  runtime: 'nodejs',
};

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function chunkBase64(base64, size = 76) {
  const chunks = [];
  for (let i = 0; i < base64.length; i += size) {
    chunks.push(base64.slice(i, i + size));
  }
  return chunks.join('\r\n');
}

async function buildMimeMessage({ from, to, subject, htmlBody }) {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const normalizedHtmlBody = htmlBody.replace(
    /src=(['"])\/orangehrm-logo\.png\1/gi,
    'src=$1cid:company-logo$1',
  );
  const useInlineLogo = normalizedHtmlBody.includes('cid:company-logo');
  let logoBase64 = '';

  if (useInlineLogo) {
    const candidatePaths = [
      path.join(process.cwd(), 'public', 'orangehrm-logo.png'),
      path.join(process.cwd(), 'orangehrm-logo.png'),
    ];

    for (const logoPath of candidatePaths) {
      try {
        logoBase64 = await readFile(logoPath, 'base64');
        break;
      } catch {
        // Try next candidate path.
      }
    }
  }

  const parts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/related; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    normalizedHtmlBody,
  ];

  if (useInlineLogo && logoBase64) {
    parts.push(
      '',
      `--${boundary}`,
      'Content-Type: image/png; name="company-logo.png"',
      'Content-Transfer-Encoding: base64',
      'Content-ID: <company-logo>',
      'Content-Disposition: inline; filename="company-logo.png"',
      '',
      chunkBase64(logoBase64),
    );
  }

  parts.push('', `--${boundary}--`);
  return parts.join('\r\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subject, htmlBody, to } = req.body || {};

  if (!subject || !htmlBody) {
    return res.status(400).json({ error: 'Missing required fields: subject, htmlBody' });
  }

  try {
    const clientId = getEnv('GMAIL_CLIENT_ID');
    const clientSecret = getEnv('GMAIL_CLIENT_SECRET');
    const refreshToken = getEnv('GMAIL_REFRESH_TOKEN');
    const gmailUser = getEnv('GMAIL_USER');
    const redirectUri = process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground';

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken =
      typeof accessTokenResponse === 'string'
        ? accessTokenResponse
        : accessTokenResponse?.token;

    if (!accessToken) {
      throw new Error('Could not obtain Gmail access token');
    }

    const recipient = typeof to === 'string' && to.trim() ? to.trim() : gmailUser;

    const rawMessage = await buildMimeMessage({
      from: gmailUser,
      to: recipient,
      subject,
      htmlBody,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: base64UrlEncode(rawMessage),
      },
    });

    return res.status(200).json({ success: true, to: recipient });
  } catch (error) {
    console.error('Self-test email send failed:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}