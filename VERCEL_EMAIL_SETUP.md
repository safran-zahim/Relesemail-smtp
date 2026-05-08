# Vercel Gmail API Setup

This project is Vite + React with a Vercel Serverless Function at `api/send-email.js`.

## 1. Add Vercel Environment Variables

In Vercel: Project Settings -> Environment Variables.

Required:

- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- `GMAIL_USER`
- `MY_SECRET_KEY`

Optional:

- `GMAIL_REDIRECT_URI` (defaults to `https://developers.google.com/oauthplayground`)

## 2. Google OAuth Details

- Create/Use OAuth Client in Google Cloud Console.
- Add `https://developers.google.com/oauthplayground` as an authorized redirect URI (or use your own and set `GMAIL_REDIRECT_URI`).
- Generate a refresh token once locally and paste it into `GMAIL_REFRESH_TOKEN` in Vercel.
- If OAuth Consent is in Testing, refresh tokens may expire more often.

## 3. API Endpoint

POST `/api/send-email`

Headers:

- `Content-Type: application/json`
- `x-api-key: <MY_SECRET_KEY>`

Body:

```json
{
  "to": "recipient@example.com",
  "subject": "Test message",
  "htmlBody": "<h1>Hello</h1><p>This is a test</p>"
}
```

Example curl:

```bash
curl -X POST https://your-app.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_SECRET" \
  -d '{"to":"recipient@example.com","subject":"Hello","htmlBody":"<h1>Hi</h1>"}'
```

## 4. Security Notes

- Never expose `MY_SECRET_KEY` to browser-side code.
- If this route is called from a public frontend, add authentication/authorization before calling it.
- Consider rate limiting and recipient allow-lists for production.
