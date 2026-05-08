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
  let normalizedHtmlBody = htmlBody;

  const attachments = [];

  // Extract and replace base64 images
  let imageIndex = 1;
  normalizedHtmlBody = normalizedHtmlBody.replace(
    /src=(['"])data:(image\/[^;]+);base64,([^'"]+)\1/gi,
    (match, quote, mimeType, base64Data) => {
      const cid = `inline-image-${imageIndex++}`;
      const extension = mimeType.split('/')[1] || 'png';
      
      attachments.push({
        filename: `${cid}.${extension}`,
        content: Buffer.from(base64Data, 'base64'),
        cid: cid,
        contentType: mimeType,
        contentDisposition: 'inline',
      });
      
      return `src=${quote}cid:${cid}${quote}`;
    }
  );

  // Extract and replace relative paths (like /icon_01.png or /orangehrm-logo.png)
  const relativeImages = [];
  normalizedHtmlBody = normalizedHtmlBody.replace(
    /src=(['"])\/([^'"]+\.(png|jpg|jpeg|gif|svg))\1/gi,
    (match, quote, filename) => {
      const cid = `local-${filename.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      relativeImages.push({ filename, cid });
      return `src=${quote}cid:${cid}${quote}`;
    }
  );

  // Read each relative image and attach it
  for (const img of relativeImages) {
    if (attachments.some(a => a.cid === img.cid)) continue;

    const candidatePaths = [
      path.join(process.cwd(), 'public', img.filename),
      path.join(process.cwd(), img.filename),
    ];

    let content = null;
    for (const imgPath of candidatePaths) {
      try {
        content = await readFile(imgPath);
        break;
      } catch {
        // Try next candidate path
      }
    }

    if (content) {
      const ext = img.filename.split('.').pop().toLowerCase();
      let mimeType = `image/${ext}`;
      if (ext === 'jpg') mimeType = 'image/jpeg';
      if (ext === 'svg') mimeType = 'image/svg+xml';

      attachments.push({
        filename: img.filename,
        content: content,
        cid: img.cid,
        contentType: mimeType,
        contentDisposition: 'inline',
      });
    }
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

  if (req.headers['x-api-key'] !== process.env.MY_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { to, subject, htmlBody } = req.body || {};

  if (!to || !subject || !htmlBody) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, htmlBody' });
  }

  try {
    const smtpHost = getEnv('SMTP_HOST');
    const smtpPort = Number.parseInt(getEnv('SMTP_PORT'), 10);
    const smtpSecure = parseBoolean(process.env.SMTP_SECURE, smtpPort === 465);
    const smtpUser = getEnv('SMTP_USER');
    const smtpPass = getEnv('SMTP_PASS');
    const smtpFrom = getEnv('SMTP_FROM');

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
      to,
      subject,
      htmlBody,
    });

    await transporter.sendMail(message);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send failed:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
