# Local verification and operational handoff

## Local setup

Use a disposable local MySQL database only. The migration and seed entry points require all of these settings: `NODE_ENV=development`, `LOCAL_SCHEMA_ONLY=true`, `DB_NAME=ethiroli_local_test`, a loopback `DB_HOST`, and explicitly configured `DB_USER` and `DB_PASSWORD`. Set the application's session/encryption secrets and mail transport in an ignored local `.env`; do not commit credentials. The checked-in `backend/.env.example` is a template, not a ready-to-run credential set.

Create a disposable database and a dedicated local user with privileges limited to that database. In a MySQL client, replace `YOUR_LOCAL_TEST_PASSWORD` with your own local-only password and run:

```sql
CREATE DATABASE ethiroli_local_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ethiroli_local'@'127.0.0.1' IDENTIFIED BY 'YOUR_LOCAL_TEST_PASSWORD';
GRANT ALL PRIVILEGES ON ethiroli_local_test.* TO 'ethiroli_local'@'127.0.0.1';
```

Then copy `backend/.env.example` to `backend/.env` and set `NODE_ENV=development`, `LOCAL_SCHEMA_ONLY=true`, `DB_HOST=127.0.0.1`, your local `DB_PORT` (usually `3306`), `DB_NAME=ethiroli_local_test`, `DB_USER=ethiroli_local`, and `DB_PASSWORD` to the password chosen above. Set non-empty random `SESSION_SECRET`, `ENCRYPTION_KEY`, and `ENCRYPTION_SECRET` values, plus `REDIS_ENABLED=false`, `KAFKA_ENABLED=false`, and `N8N_ENABLED=false` when those local services are not running. Keep this `.env` local; the migration commands load it. The initializer reads only DDL from `backend/src/config/base_schema.sql`; it deliberately skips legacy inserts, triggers, and views.

```powershell
npm --prefix backend run migrate
npm --prefix backend run db:migrate -- 023
npm --prefix backend run db:migrate -- 024
npm --prefix backend run db:migrate -- 025
```

Migration 023 adds organization units, roles, and employee assignment fields. Migration 024 reconciles legacy `contact_messages` rows into the canonical `contact_inquiries` inbox using a unique source ID, preserving old submissions and their timestamps. It also adds leave cancellation and review-note storage. Migration 025 supplies the attendance session/work-mode columns and calendar event fields used by attendance and leave approvals. The backend starts without silently applying migrations; run these commands explicitly against the disposable database first.

Run the backend and frontend in separate terminals from the repository root:

```powershell
npm --prefix backend run dev
```

```powershell
npm --prefix frontend run dev
```

Vite prints the local URL. The public site is `/`; internal areas are `/app/super-admin/dashboard`, `/app/hr/dashboard`, `/app/manager/dashboard`, and `/app/employee/dashboard`. New accounts are created in HR and activate through the emailed `/activate?token=...` link. If mail is not configured, the account stays inactive; configure mail and create a fresh invitation.

## Verification completed

- Isolated MySQL instance on loopback port 3307: baseline DDL applied (110 statements; 19 seed/trigger/view/non-DDL statements skipped), then migrations 023, 024, and 025 applied successfully. The original MySQL instance and any production database were not modified.
- Local API integration against that isolated schema: readiness/DB check passed; public contact and meeting requests persisted; employee and HR logins worked; employee leave submission and HR approval persisted; leave approval created its calendar event; attendance check-in and HR listing worked; unauthenticated inbox access returned 401; and an employee decision attempt returned 403. Fixtures were stored only in the disposable schema.
- Focused read-only policy, local schema safety, task lifecycle, and migration splitter tests: `node --test tests/test-ceo-read-only.js tests/test-local-schema-safety.js tests/test-task-workflow.js tests/test-migration-splitter.js` (9 passing).
- Frontend role-routing tests: `npm test -- --run` (15 passing).
- Backend JavaScript syntax checks: passed for all checked-in backend JS after fixing stray quote typos in three legacy student utility imports. The database-dependent student scripts were not executed.
- Focused frontend ESLint: passed.
- Full frontend ESLint: 274 errors and 23 warnings remain across the legacy repository (latest full scan). The changed attendance, HR, Manager, and CEO files pass focused ESLint; the full lint set still includes unused code and other issues outside those changed files. A clean full-repository lint result is not yet achieved.
- Frontend dependency audit: two moderate React Router advisories remain. The suggested fix is a major v7 upgrade and was not applied without compatibility review. Backend audit: zero vulnerabilities.
- Vite production build: passed; emitted the public site and four internal portal HTML shells.
- Local Vite route smoke check: HTTP 200 for `/`, the four portal dashboards, and `/activate?token=test`.

## Deployment handoff (not performed)

Before any production release, review the organization migration against a production snapshot and prepare a tested backup/rollback. Provision the four portal routes and real email transport, verify CEO read scopes and HR/manager authorization with real role accounts, and run the database migration through the organization's approved change process. No production deployment or production migration is authorized by this rebuild task.
