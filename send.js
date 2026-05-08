import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number.parseInt(process.env.SMTP_PORT || '', 10);
  const smtpSecure = parseBoolean(process.env.SMTP_SECURE, smtpPort === 465);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  if (!smtpHost || Number.isNaN(smtpPort) || !smtpUser || !smtpPass || !smtpFrom) {
    throw new Error('Missing SMTP settings. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.');
  }

  const htmlBody = await readFile(path.join(__dirname, 'output.html'), 'utf8');
  const to = process.env.TEST_RECIPIENT || smtpFrom;
  const subject = process.env.TEST_SUBJECT || 'Local Test: OrangeHRM 8.1';

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const result = await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    html: htmlBody,
  });

  console.log(`SUCCESS: Email sent. Message ID: ${result.messageId}`);
  console.log(`To: ${to}`);
}

main().catch(error => {
  console.error('ERROR:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});