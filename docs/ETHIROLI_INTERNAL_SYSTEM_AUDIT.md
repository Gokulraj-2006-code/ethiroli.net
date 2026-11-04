# Ethiroli internal system audit and implementation plan

## Architecture found

- The existing application is a React 19 / Vite multi-page frontend. `index.html` serves the public site; separate entry points serve role portals. The public site and its routes are preserved.
- The backend is Express 4 with MySQL, cookie/session and bearer-token authentication, optional Redis session caching, REST APIs, and Socket.IO. The schema and numbered SQL migrations live under `backend/`.
- Existing employee, intern, attendance, leave, task, project, HR, and reporting routes can be reused. Employee and intern identities are currently split across `employees` and `interns` tables and `EMPLOYEE` / `INTERN` user roles. `employees` has a department string but neither it nor `users` has a branch field or branch relationship.
- The frontend currently exposes many unrelated role portals (student, tutor, finance, sales, reception, and others) and the Super Admin route tree contains platform SaaS, billing, automation, messaging, and system administration screens.
- Root scripts provide a Vite build and lint. The root `test` script only prints a success message and is not a real test suite. Backend tests are mostly integration scripts that expect a configured database and, in several cases, mutate it.

## Findings and risks

- `requireRole` grants `SUPER_ADMIN` an unconditional bypass, including for routes whose method otherwise mutates data. This conflicts with the CEO's read-only requirement.
- Employee and intern creation controllers synthesize account details and use fixed default passwords when none are supplied. That is unsafe for live onboarding and must be replaced by a verified invitation / password setup flow before production use.
- Employee records contain encrypted PAN and bank account fields; broad HR / admin employee APIs return those fields in the employee serializer. CEO monitoring should not reuse that response as-is.
- Tasks have an assignee and due date, but the generic task read/detail/status endpoints do not consistently enforce ownership. The employee-specific task API does scope the employee list to the signed-in user and is the safer portal API.
- Branch-level access and branch monitoring cannot be implemented against the current schema: no branch entity, employee branch key, or manager scope assignment exists. Adding these requires a reviewed, backward-compatible migration and mapping real people to real branches.
- Attendance distinguishes explicit `ABSENT` rows from missing rows, but its default is `ABSENT`; reports must only treat a saved row as confirmed absence and must not infer absence from a missing row.
- Department names exist as strings and a separate departments lookup table exists, but no employee foreign key or agreed department/sub-role records are present. The four requested divisions can be configured without fabricating staff assignments.
- The current Super Admin dashboard reports platform-wide SaaS counts and includes a hardcoded operational-health percentage. This is not an accurate company workforce overview.

## Features to preserve

- Public marketing site, branding, SEO, public routes, existing auth/session implementation, MySQL schema, API structure, employee self-service APIs, and current attendance/task history.
- Existing HR registration and management routes pending replacement of their unsafe account bootstrap behavior.
- Existing MySQL migration history; no migration has been run as part of this audit.

## Implementation plan

1. Enforce CEO read-only centrally after authentication so route omissions cannot permit writes.
2. Route interns through the existing Employee Portal screens and employee self-service API, while deriving their `Intern` label from the authenticated account / intern record.
3. Simplify the Super Admin UI to company monitoring and remove unrelated platform administration modules from that portal.
4. Build CEO metrics only from supported workforce, attendance, leave, and task records; show missing attendance separately and expose branch configuration gaps instead of inventing branch data.
5. Review HR employee / intern provisioning for duplicate identity checks, safe initial credentials, and auditable updates before exposing it as a production onboarding workflow.
6. Add branch / manager scope and normalized department configuration only through a non-destructive migration with real data mapping and a reviewed rollback plan.
7. Run the real frontend build and lint plus focused backend tests. Run database-backed integration tests only when a safe test database is configured.

## Scope and deployment status

The existing frontend and API were inspected before edits. No database migration, production-data write, deployment, or secret access was performed. The current project cannot honestly be marked production-ready until branch scope, secure account provisioning, consistent API object-level authorization, and database-backed permission tests are completed.

## Implemented in this pass

- Added a centralized authenticated-request rule that returns HTTP 403 for `POST`, `PUT`, `PATCH`, and `DELETE` from the `SUPER_ADMIN` role. `GET`, `HEAD`, and `OPTIONS` remain available for monitoring.
- Replaced the Super Admin platform command dashboard with company workforce / attendance / leave / task metrics from existing database records. Explicit absence rows, approved leave, and missing attendance records are reported separately. Query failures for employee and intern totals surface as errors rather than zeroes.
- Removed unrelated platform administration routes and navigation from the Super Admin portal.
- Routed intern login and the legacy intern entry page to the shared Employee Portal routes and self-service pages. The account role remains `INTERN` and is not elevated.
- Removed sensitive financial, government-ID, and personal contact fields from CEO employee directory/detail API responses.
- Added a focused unit test for CEO mutation method policy.

## Verification

- `npm run build`: passed after source changes; the generated `frontend/dist` artifacts were restored so build output is not included in the source change set.
- Focused ESLint on the modified frontend files: passed.
- `node --test tests/test-ceo-read-only.js`: 3 tests passed.
- Repository-wide `npm run lint`: failed on 322 existing lint errors and 24 warnings across unrelated files, including parse errors. The modified frontend files passed targeted lint.
- Database-backed integration tests were not run because the project uses a live MySQL schema and no safe disposable test database was configured. The root `npm test` is only an `echo` placeholder and was not treated as meaningful test coverage.
- Dependency installation reported 6 frontend and 4 backend package audit findings. No automatic dependency upgrades were applied.
