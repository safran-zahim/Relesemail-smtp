import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function loadJsonIfExists(fileName) {
  try {
    const filePath = path.join(__dirname, fileName);
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function loadEnvFile() {
  try {
    const envText = await readFile(path.join(__dirname, '.env'), 'utf8');
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim();

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // No local .env file present; rely on existing environment or JSON files.
  }
}

async function main() {
  await loadEnvFile();

  const credentials = (await loadJsonIfExists('credentials.json')) || {
    web: {
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
    },
  };
  const token = (await loadJsonIfExists('token.json')) || {
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  };

  const client = credentials.installed || credentials.web;

  if (!client?.client_id || !client?.client_secret) {
    throw new Error('Missing Gmail client credentials. Add credentials.json or set GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET.');
  }

  if (!token?.refresh_token) {
    throw new Error('Missing Gmail refresh token. Add token.json or set GMAIL_REFRESH_TOKEN.');
  }

  const gmailUser = process.env.GMAIL_USER;
  if (!gmailUser) {
    throw new Error('Missing GMAIL_USER.');
  }

  const htmlBody = await readFile(path.join(__dirname, 'output.html'), 'utf8');
  const to = process.env.TEST_RECIPIENT || gmailUser;
  const subject = process.env.TEST_SUBJECT || 'Local Test: OrangeHRM 8.1';

  const oauth2Client = new google.auth.OAuth2(
    client.client_id,
    client.client_secret,
    process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground',
  );

  oauth2Client.setCredentials({ refresh_token: token.refresh_token });

  const accessTokenResponse = await oauth2Client.getAccessToken();
  const accessToken = typeof accessTokenResponse === 'string'
    ? accessTokenResponse
    : accessTokenResponse?.token;

  if (!accessToken) {
    throw new Error('Could not obtain Gmail access token.');
  }

  const rawMessage = [
    `From: ${gmailUser}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    htmlBody,
  ].join('\r\n');

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: base64UrlEncode(rawMessage),
    },
  });

  console.log(`SUCCESS: Email sent. ID: ${result.data.id}`);
  console.log(`To: ${to}`);
}

main().catch(error => {
  console.error('ERROR:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});