import nodemailer from 'nodemailer';
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

function parseBoolean(value, fallback = false) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

async function buildEmailPayload({ from, to, subject, htmlBody }) {
  const normalizedHtmlBody = htmlBody.replace(
    /src=(['"])\/orangehrm-logo\.png\1/gi,
    'src=$1cid:company-logo$1',
  );
  const useInlineLogo = normalizedHtmlBody.includes('cid:company-logo');
  let logoContent = null;

  if (useInlineLogo) {
    const candidatePaths = [
      path.join(process.cwd(), 'public', 'orangehrm-logo.png'),
      path.join(process.cwd(), 'orangehrm-logo.png'),
    ];

    for (const logoPath of candidatePaths) {
      try {
        logoContent = await readFile(logoPath);
        break;
      } catch {
        // Try next candidate path.
      }
    }
  }

  const attachments = [];
  if (useInlineLogo && logoContent) {
    attachments.push({
      filename: 'company-logo.png',
      content: logoContent,
      cid: 'company-logo',
      contentType: 'image/png',
      contentDisposition: 'inline',
    });
  }

  return {
    from,
    to,
    subject,
    html: normalizedHtmlBody,
    attachments,
  };
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
    const smtpHost = getEnv('SMTP_HOST');
    const smtpPort = Number.parseInt(getEnv('SMTP_PORT'), 10);
    const smtpSecure = parseBoolean(process.env.SMTP_SECURE, smtpPort === 465);
    const smtpUser = getEnv('SMTP_USER');
    const smtpPass = getEnv('SMTP_PASS');
    const smtpFrom = getEnv('SMTP_FROM');
    const recipient = typeof to === 'string' && to.trim() ? to.trim() : smtpFrom;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const message = await buildEmailPayload({
      from: smtpFrom,
      to: recipient,
      subject,
      htmlBody,
    });

    await transporter.sendMail(message);

    return res.status(200).json({ success: true, to: recipient });
  } catch (error) {
    console.error('Self-test email send failed:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}