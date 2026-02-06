# ikaze_server

Quick start

1. Copy `.env.example` to `.env` and fill your DB credentials and `JWT_SECRET`.
2. Install dependencies: `npm install`.
3. Run seed to create demo accounts: `npm run seed`.
4. Start server: `npm run start`.

Testing (recommended)

- Install devDependencies: `npm install --dev` (or `npm install`).
- Run tests: `npm test` (tests use an in-memory sqlite database).

Demo accounts created by `npm run seed`:

- admin: `admin@ikaze.local` / `password123` (role: ADMIN)
- security: `security@ikaze.local` / `password123` (role: SECURITY)

API notes

- Approve appointment: POST `/api/appointment/:id/approve` (ADMIN/DEAN)
- Reject appointment: POST `/api/appointment/:id/reject` (ADMIN/DEAN)
- Validate APT code: POST `/api/appointment/validate` (SECURITY/ADMIN/DEAN)
