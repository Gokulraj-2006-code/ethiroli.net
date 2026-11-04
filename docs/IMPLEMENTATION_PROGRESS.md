# Ethiroli rebuild progress

Working branch: `codex/complete-internal-system`  
Recovery checkpoint: Git stash `pre-end-to-end-audit implementation checkpoint` (plus the earlier `pre-master-prompt implementation checkpoint`)  
Production deployment and production database migrations are excluded.

## Acceptance checklist

- [x] Preserve the current public marketing homepage and original brand assets.
- [x] CEO writes are rejected centrally; CEO personnel responses omit sensitive fields.
- [x] Interns use the shared Employee Portal and derive their label from personnel data.
- [x] Remove the authentication magic-password bypass and unauthenticated production-data sync route.
- [x] Keep exactly four internal portal areas and canonicalize legacy routes.
- [x] Add branches, org hierarchy, manager scopes, and task review history through a guarded local migration.
- [x] Implement database-backed CEO monitoring, including branch filtering and attendance calendar.
- [x] Implement scoped Manager dashboard and task lifecycle.
- [x] Replace HR mock creation with secure, database-backed onboarding and directory management.
- [x] Finish Employee Portal task submission and attendance/profile integration.
- [x] Implement persistent public enquiry/meeting requests and internal HR/CEO read views with HR status/follow-up handling.
- [x] Add HR leave inbox, employee leave decisions, overlap/concurrency controls, and read-only CEO review.
- [x] Enforce task lifecycle transitions and stable UUID task creation.
- [x] Verify frontend role routing and focused backend policy/workflow tests.
- [ ] Run disposable database migrations and API integration tests.
- [ ] Run browser end-to-end flows and responsive/error checks.
- [x] Re-run full frontend lint and dependency audit after the final changes (results recorded below).
- [x] Document safe local setup and deployment handoff checklist.

## Verification constraints

No disposable test database has been established. Database migration and database-backed integration checks have not been run. HR/CEO/Manager organization views require migration 023; contact and leave workflow persistence also requires migration 024. See `LOCAL_TESTING_AND_DEPLOYMENT.md` for guarded setup. Production migration and deployment are excluded.

The frontend full-repository lint currently reports 311 errors and 24 warnings across 1,295 files. The nine focused implementation files report zero lint findings. Frontend dependency audit reports two moderate React Router advisories; the available remediation requires upgrading `react-router-dom` to v7, so the current v6 dependency was retained to avoid an unverified major-version routing change. Backend dependency audit reports zero vulnerabilities. Local route smoke checks returned HTTP 200 for the public page, all four portal deep links, and `/activate`.

## Implementation notes

- Existing employee and intern data remain in separate legacy tables; new directory relationships must work without fabricating staff assignments.
- Suggested departments and sub-roles are configuration only.
- Attendance absence counts must use explicit saved `ABSENT` rows; missing rows remain “not recorded”.
- `E:\ethiroli final\Ethiroli_pvt` contains unrelated uncommitted safety changes and is being treated as read-only recovery reference.
