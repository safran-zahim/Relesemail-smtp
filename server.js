import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sendEmailHandler from './api/send-email.js';
import sendTestEmailHandler from './api/send-test-email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const port = Number.parseInt(process.env.PORT || '3000', 10);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function createApiResponse(nodeRes) {
  const response = {
    status(code) {
      nodeRes.statusCode = code;
      return response;
    },
    json(payload) {
      if (!nodeRes.headersSent) {
        nodeRes.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      nodeRes.end(JSON.stringify(payload));
      return response;
    },
    send(payload) {
      if (typeof payload === 'object' && payload !== null) {
        return response.json(payload);
      }
      if (!nodeRes.headersSent) {
        nodeRes.setHeader('Content-Type', 'text/plain; charset=utf-8');
      }
      nodeRes.end(String(payload ?? ''));
      return response;
    },
    setHeader(name, value) {
      nodeRes.setHeader(name, value);
      return response;
    },
  };

  return response;
}

async function readJsonBody(nodeReq) {
  const chunks = [];

  for await (const chunk of nodeReq) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) {
    return undefined;
  }

  const contentType = String(nodeReq.headers['content-type'] || '');
  if (contentType.includes('application/json') || contentType.includes('+json')) {
    return JSON.parse(raw);
  }

  return raw;
}

async function runApiHandler(handler, nodeReq, nodeRes) {
  const req = {
    method: nodeReq.method,
    headers: nodeReq.headers,
    body: await readJsonBody(nodeReq),
  };
  const res = createApiResponse(nodeRes);

  try {
    await handler(req, res);
    if (!nodeRes.writableEnded) {
      nodeRes.end();
    }
  } catch (error) {
    console.error('API handler failed:', error);
    if (!nodeRes.headersSent) {
      nodeRes.statusCode = 500;
      nodeRes.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    nodeRes.end(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal Server Error',
    }));
  }
}

async function serveStaticAsset(nodeReq, nodeRes, pathname) {
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const resolvedPath = path.normalize(path.join(distDir, relativePath));

  if (!resolvedPath.startsWith(distDir)) {
    nodeRes.statusCode = 403;
    nodeRes.end('Forbidden');
    return;
  }

  try {
    const body = await readFile(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    nodeRes.statusCode = 200;
    nodeRes.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    nodeRes.end(body);
  } catch {
    if (pathname !== '/' && !path.extname(pathname)) {
      const body = await readFile(path.join(distDir, 'index.html'));
      nodeRes.statusCode = 200;
      nodeRes.setHeader('Content-Type', 'text/html; charset=utf-8');
      nodeRes.end(body);
      return;
    }

    nodeRes.statusCode = 404;
    nodeRes.setHeader('Content-Type', 'text/plain; charset=utf-8');
    nodeRes.end('Not Found');
  }
}

const server = createServer(async (nodeReq, nodeRes) => {
  if (!nodeReq.url) {
    nodeRes.statusCode = 400;
    nodeRes.end('Bad Request');
    return;
  }

  const requestUrl = new URL(nodeReq.url, `http://${nodeReq.headers.host || 'localhost'}`);
  const { pathname } = requestUrl;

  if (pathname === '/api/send-email') {
    await runApiHandler(sendEmailHandler, nodeReq, nodeRes);
    return;
  }

  if (pathname === '/api/send-test-email') {
    await runApiHandler(sendTestEmailHandler, nodeReq, nodeRes);
    return;
  }

  if (pathname.startsWith('/api/')) {
    nodeRes.statusCode = 404;
    nodeRes.setHeader('Content-Type', 'application/json; charset=utf-8');
    nodeRes.end(JSON.stringify({ error: 'Not Found' }));
    return;
  }

  await serveStaticAsset(nodeReq, nodeRes, pathname);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});