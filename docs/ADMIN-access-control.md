# ADMIN Access Control

## 1. Role Title and Summary
- **Role**: Admin  
- **Purpose**: Mid‑level administrative role with broad system access, delegated authority for day‑to‑day operations, user management (excluding super‑admin functions), and configuration of assigned modules.  
- **Portal Slug**: `admin`  
- **MFA Required**: Yes  
- **Session Duration**: 8 hours  
- **Cookie Path**: `/app/admin`

## 2. Permission Matrix
| Resource / Module | Read | Create | Update | Delete | API Endpoints |
|-------------------|------|--------|--------|--------|----------------|
| Employees | ✅ | ✅ | ✅ | ✅ | `GET /v1/employees`, `POST /v1/employees`, `PATCH /v1/employees/:id`, `DELETE /v1/employees/:id` |
| Interns | ✅ | ✅ | ✅ | ✅ | `GET /v1/interns`, `POST /v1/interns`, `PATCH /v1/interns/:id`, `DELETE /v1/interns/:id` |
| Attendance | ✅ | ✅ | ✅ | ✅ | `GET /v1/attendance`, `POST /v1/attendance`, `PATCH /v1/attendance/:id`, `DELETE /v1/attendance/:id` |
| Leaves | ✅ | ✅ | ✅ | ✅ | `GET /v1/leaves`, `POST /v1/leaves`, `PATCH /v1/leaves/:id`, `DELETE /v1/leaves/:id` |
| Courses | ✅ | ✅ | ✅ | ✅ | `GET /v1/courses`, `POST /v1/courses`, `PATCH /v1/courses/:id`, `DELETE /v1/courses/:id` |
| Modules | ✅ | ✅ | ✅ | ✅ | `GET /v1/modules`, `POST /v1/modules`, `PATCH /v1/modules/:id`, `DELETE /v1/modules/:id` |
| Lessons | ✅ | ✅ | ✅ | ✅ | `GET /v1/lessons`, `POST /v1/lessons`, `PATCH /v1/lessons/:id`, `DELETE /v1/lessons/:id` |
| Enrollments | ✅ | ✅ | ✅ | ✅ | `GET /v1/enrollments`, `POST /v1/enrollments`, `PATCH /v1/enrollments/:id`, `DELETE /v1/enrollments/:id` |
| Quizzes | ✅ | ✅ | ✅ | ✅ | `GET /v1/quizzes`, `POST /v1/quizzes`, `PATCH /v1/quizzes/:id`, `DELETE /v1/quizzes/:id` |
| Assignments | ✅ | ✅ | ✅ | ✅ | `GET /v1/assignments`, `POST /v1/assignments`, `PATCH /v1/assignments/:id`, `DELETE /v1/assignments/:id` |
| Interviews | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Payroll | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Performance | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Calendar | ✅ | ✅ | ✅ | ✅ | `GET /v1/calendar`, `POST /v1/calendar`, `PATCH /v1/calendar/:id`, `DELETE /v1/calendar/:id` |
| Holidays | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Approvals | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Clients | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Subscriptions | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Tasks | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Invoices | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Company Settings | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Leads | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Payments | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Transactions | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Reports | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Communications | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Forums | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Badges | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Certificates | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Projects | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Mind Maps | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Payslips | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Auth & Users | ✅ | ✅ | ✅ | ✅ | `GET /v1/users`, `POST /v1/users`, `PATCH /v1/users/:id`, `DELETE /v1/users/:id` |
| Roles | ✅ | ✅ | ✅ | ✅ | `GET /v1/role`, `POST /v1/role`, `PATCH /v1/role/:id`, `DELETE /v1/role/:id` |
| System Settings | ❌ | ❌ | ❌ | ❌ | *No permissions* |
| Audit Logs | ✅ | ❌ | ❌ | ❌ | `GET /v1/audit-logs` |
| Health Checks | ❌ | ❌ | ❌ | ❌ | `GET /health` |
| Monitoring | ❌ | ❌ | ❌ | ❌ | *No permissions* |

## 3. Access Boundaries
- Cannot create, update, or delete any resource (read‑only for most modules).  
- No access to financial modules (payroll, payments, transactions, invoices).  
- Cannot modify system settings, tenant configurations, or global role definitions.  
- Limited to managing own portal scope (`/app/admin`); cannot access other role‑specific endpoints.

## 4. User Flow & Typical Actions
- Review attendance, leave requests, and course enrollment records.  
- Approve or reject leave applications, performance reviews.  
- Generate ad‑hoc reports for internal stakeholders.  
- Manage user accounts within the admin portal (view, reset passwords, assign temporary roles).

## 5. Compliance & Security Considerations
- All read actions are logged; deletion of records is prohibited.  
- Access to audit logs is permitted for accountability.  
- MFA enforced; session timeout after 8 hours.  
- Data retention policies apply; sensitive information must be accessed only for legitimate review.

Generated from `backend/src/config/constants.js` `ROLE_PERMISSIONS` and `backend/src/routes/index.js`.
