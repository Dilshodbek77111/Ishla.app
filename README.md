# Ishla

Ishla — O‘zbekiston bozori uchun Node.js + Express + Vanilla JS ish marketplace MVP. Backend REST API, JSON file database, seeker/employer/admin rollari, OTP email verification, CV upload, moderation, premium, Click/Payme webhook lifecycle va responsive frontend mavjud.

## Stack
Node.js 20+, Express 5, JSON file DB, bcryptjs, JWT httpOnly cookie, Helmet, CORS, express-rate-limit, Multer, Nodemailer, Vanilla HTML/CSS/JS.

## Run
```bash
npm install
cp .env.example .env
npm start
```
Open `http://localhost:3000`.
Development: `npm run dev`. Tests: `npm test`.

## Demo credentials
Seed happens automatically on first start. Password is `SEED_PASSWORD` (default `IshlaDemo123!`).
- admin@ishla.local — admin
- employer1@ishla.local — employer
- employer2@ishla.local — employer
- seeker1@ishla.local … seeker5@ishla.local — seekers

Change `SEED_PASSWORD` before sharing a non-local environment. The seed only runs when `data/db.json` has no users.

## Architecture
`server.js` mounts route modules; `db.js` is a serialized JSON transaction layer using temp-file + rename atomic replacement; middleware owns auth/validation/upload; services own OTP/email/moderation; frontend is a small hash-router SPA.

The JSON database is intentionally a single-process/small-traffic store. The in-process queue prevents concurrent Node requests from corrupting writes. It is **not** a distributed lock: do not run multiple Node processes against the same `db.json`.

## API
- Auth: `/api/auth/register`, `/verify-otp`, `/resend-otp`, `/login`, `/logout`, `/me`, `/forgot-password`, `/reset-password`
- Profile: `/api/profile`, `/api/profile/cv`
- Jobs: `/api/listings`, `/api/listings/:id`, `/api/listings/mine`
- Applications/offers/saved: `/api/applications/*`
- Employer search: `/api/employer-search`
- Categories: `/api/categories`
- Admin: `/api/admin/*`
- Payments: `/api/subscribe`, `/api/payments/click`, `/api/payments/payme`
- Health: `/api/health`

## Security
Passwords are bcrypt hashes. Auth uses JWT in an httpOnly cookie. Auth and API rate limits are enabled. Sensitive secrets are environment-only. CVs are stored outside `public` and served only after authentication. Public job search only returns approved jobs. Premium checks are server-side. Admin actions are audited. Click signature and Payme Basic authentication are verified before state changes.

### Important production hardening
This MVP is deliberately JSON-file based. For real traffic, migrate transactions to PostgreSQL/Redis-backed sessions/locks and put uploads in object storage with malware scanning. Also put the app behind HTTPS and a reverse proxy, configure a fixed `FRONTEND_ORIGIN`, rotate JWT secrets, and use a dedicated SMTP account.

## Click
The Shop API prepare/complete endpoints are exposed at `POST /api/payments/click`. Configure merchant/service/secret values in `.env` and register the exact webhook URLs with Click. Signature is checked before any payment state transition. Duplicate complete callbacks are idempotent.

## Payme
`POST /api/payments/payme` implements `CheckPerformTransaction`, `CreateTransaction`, `PerformTransaction`, `CancelTransaction`, `CheckTransaction`, and `GetStatement`, with Basic authentication and persistent transaction mapping. Amounts are validated in tiyin. Payme may repeat Create/Perform/Cancel calls; handlers are designed to return the existing state instead of double-crediting premium.

## Email / OTP
OTP is seven digits, expires after 15 minutes, is stored hashed, has a five-attempt limit and resend cooldown. In development without SMTP, the code is printed to the server console. Forgot-password intentionally returns the same success response whether the email exists.

## File uploads
PDF/DOC/DOCX only, 5MB maximum, random filenames. PDFs additionally receive a `%PDF-` signature check. DOC/DOCX are still only MIME/extension validated; for production, add antivirus/content inspection before accepting untrusted documents.

## Limitations
- JSON DB is not suitable for multi-instance production deployment.
- Click/Payme credentials and merchant-side endpoint activation must be supplied by the merchant; no fake success flow is included.
- Payme/Click sandbox/live configuration cannot be verified without merchant credentials.
- Category moderation is rule-based and can produce false positives/negatives; human admin moderation remains authoritative.
- The frontend is an MVP SPA, not a design-system-scale application.
- OpenAPI UI is intentionally omitted from the first MVP to keep the dependency surface small; endpoint list is documented above.

## Testing
`npm test` runs Node's test runner. Included checks cover health, public listing visibility, auth guards, OTP shape, moderation, Click signature rejection and Payme authentication rejection. Payment sandbox success cannot be truthfully tested without provider credentials.
