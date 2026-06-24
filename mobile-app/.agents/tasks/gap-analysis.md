# Gap Analysis: HTML Inspiration vs React Native Implementation

## Summary

The HTML inspiration is a six-role operations prototype with role-specific dashboards, task flows, attendance proof flows, branch hubs, inline forms, audit context, and rich decision surfaces. The React Native implementation currently covers only three role IDs (`lc`, `branchManager`, `rm`) and implements many pages as simplified or reinterpreted versions of the HTML.

The largest gaps are not visual polish: they are missing roles, missing role-scoped data models, missing task audiences, missing branch/staff management flows, and missing dashboard sections that make the HTML feel operationally complete.

## Missing Roles (P0)

### Role: Worker

- **Description**: Front-line proof staff. HTML role id is `worker`, with hierarchy `Worker -> AA/LC -> Manager -> RM`.
- **Status in RN**: Completely missing from `RoleId`, `ROLES`, `currentUserByRole`, navigation, user data, task audiences, and notification scopes.
- **Pages needed**:
  - `home`
  - `tasks`
  - `complaints`
  - `attendance`
  - `notifications`
  - `profile`
- **Screens to create**:
  - `WorkerHomeScreen`
  - `WorkerTasksScreen`
  - `WorkerComplaintsScreen` or shared role-aware issue desk
  - `WorkerAttendanceScreen`
  - `WorkerNotificationsScreen`
  - `WorkerProfileScreen`
- **Missing HTML content/flows**:
  - Worker command desk with quick actions: Mark Attendance, Raise Issue.
  - Four stat cards: today's proof tasks, attendance status, open alerts, this month.
  - Today's worker task queue.
  - Proof escalation ladder.
  - Countdown focus card with submit-proof CTA.
  - Branch-head alerts panel.
  - Daily/weekly/all worker task board keyed by `workerTasks`.
  - Worker-only task action: Submit Photo.
  - Worker attendance proof page with geo/selfie capture summary.

### Role: Employee

- **Description**: Regular branch staff. HTML role id is `employee`, with hierarchy `Employee -> AA/LC -> Manager -> RM`.
- **Status in RN**: Completely missing from `RoleId`, `ROLES`, `currentUserByRole`, navigation, user data, task audiences, and notification scopes.
- **Pages needed**:
  - `home`
  - `tasks`
  - `complaints`
  - `attendance`
  - `notifications`
  - `profile`
- **Screens to create**:
  - `EmployeeHomeScreen`
  - `EmployeeTasksScreen`
  - `EmployeeComplaintsScreen` or shared role-aware issue desk
  - `EmployeeAttendanceScreen`
  - `EmployeeNotificationsScreen`
  - `EmployeeProfileScreen`
- **Missing HTML content/flows**:
  - Employee operations desk with assigned tasks, attendance, issue tracker, manager comments.
  - Priority task panel.
  - Redo watch for revoked employee tasks.
  - Micro detail panel: last geo punch, device id, supervisor, shift.
  - Daily/weekly/all employee task board keyed by `employeeTasks`.
  - Employee-only task action: Mark Complete.
  - Leave application entry point.
  - Employee attendance proof page.

### Role: AA (Admin Assistant)

- **Description**: Branch operations lead parallel to LC. HTML role id is `aa`, with pages and content matching LC but separate role identity and tab state.
- **Status in RN**: Completely missing as a first-class role. RN has only `lc`, and user creation/filter code inconsistently references `am`/worker/employee strings that are not valid `RoleId` values.
- **Pages needed**:
  - `home`
  - `tasks`
  - `complaints`
  - `branch`
  - `attendance`
  - `notifications`
  - `profile`
- **Screens to create**:
  - Either dedicated `Aa*Screen` files or shared `BranchLead*Screen` components parameterized by `aa` vs `lc`.
- **Missing HTML content/flows**:
  - AA role selector entry and current user mapping.
  - AA-specific tab keys: `aaTasks`, `aaBranch`.
  - AA branch command center using the same worker/employee/template action queues as LC.
  - AA branch hub with workers, employees, appliances, and audit tabs.

### Role identity mismatch: Manager vs Branch Manager

- **HTML role id**: `manager`.
- **RN role id**: `branchManager`.
- **Impact**: RN partially implements manager screens but does not preserve the HTML role id, hierarchy, notification scopes, task audiences, or user role values. Any data imported from the HTML shape using `manager` will not match RN filters expecting `branchManager`.

## Missing Tab State Keys

The HTML initializes these tab state keys:

- `workerTasks`
- `employeeTasks`
- `aaTasks`
- `aaBranch`
- `lcTasks`
- `lcBranch`
- `managerMonitoring`
- `managerIssues`
- `approvals`
- `notifications`
- `complaints`
- `rmAlerts`
- `rmIntelligence`
- `rmUsers`

The RN `TabState` currently omits:

- `workerTasks`
- `employeeTasks`
- `aaTasks`
- `aaBranch`

Additional gap:

- HTML dynamically uses `managerBranch` for the manager deep branch hub. RN has no `managerBranch` tab state and no `selectedBranchId` app state equivalent for entering a manager branch hub.

## Missing Screen Sections (Existing Roles)

### `LcHomeScreen` vs HTML `renderAaLcHome`

| HTML has | RN status |
| --- | --- |
| Four stat cards: Branch health, Pending tasks, Open complaints, Budget burn | Missing; RN uses shortcut tiles instead. |
| Action queue shell card | Missing. |
| Segmented action queue: Worker flow, Employee flow, Templates | Missing; RN home does not render `renderAaLcTaskTab` equivalent. |
| Task queue stats inside action tab: Pending, In progress, Closure rate | Missing. |
| Create worker/employee task and Notify team CTAs | Missing on home. |
| Template cards: Daily opening pack, Weekly compliance pack | Missing. |
| Branch watchlist with safety, attendance, quick win, manager note | Missing. |
| Staff pulse list of workers/employees with attendance and task totals | Missing because worker/employee data roles are absent. |
| Pending appliance approvals | Partially present. |
| Create Task/Add Staff/Add Appliance open forms | Partially present visually; RN routes some to pages or no-op instead of opening the relevant forms. |

### `LcTasksScreen` vs HTML `renderAaLcTasksPage` / `renderAaLcTaskTab`

| HTML has | RN status |
| --- | --- |
| Task control for branch execution, templates, and staff assignments | Reinterpreted as “My task board”. |
| Segments: Worker flow, Employee flow, Templates | Missing. RN uses status filters All/Pending/In Progress/Completed. |
| Lists all scoped tasks by task audience (`worker` or `employee`) | Missing. RN filters to tasks assigned to current LC. |
| Template cards and push-template CTAs | Missing. |
| Create `[audience]` task and Notify team CTAs | Missing. |
| Worker/employee task audience data | Missing in RN data model. |

### `LcBranchScreen` vs HTML `renderBranchHub` / `renderBranchTab`

| HTML has | RN status |
| --- | --- |
| Branch Hub header and operational control copy | Replaced by branch name/details page. |
| Top stat cards: Staff, Audit, Appliance Risk, Budget Left | Missing. |
| Tabs: Workers, Employees, Appliances, Audit | Missing Workers, Employees, and Audit tabs; RN only has Branch details and Appliances. |
| Worker cards with attendance/proof and Profile/Call actions | Missing. |
| Employee cards with attendance/proof and Profile/Call actions | Missing. |
| Appliance cards with status, approval, health, AMC, service, parts | Partially present; RN appliance list is simpler. |
| Branch Audit Trail panel | Missing. |
| Branch Compliance panel: geo attendance, proof task rate, safety issues | Missing. |
| Manager deep-dive branch hub via `drillDownBranch` | Missing for branch manager role. |

### `BranchManagerHomeScreen` vs HTML `renderManagerHome`

| HTML has | RN status |
| --- | --- |
| Four stat cards: Branches in scope, Critical issues, Budget used, Visit queue | Missing; RN uses shortcut tiles. |
| Section copy: Multi-branch overview with schedule/review CTAs | Partially present with different title/actions. |
| Branch comparison snapshot cards with attendance, SLA, open issues, next visit | Missing from home. |
| Open branch detail CTA | Missing from equivalent section because section is absent. |
| Manager watchlist | Missing. |
| Upcoming visits panel | Missing. |
| Schedule Visit CTA | Missing on home. |
| Review Approvals CTA | Present. |

### `BranchManagerMonitoringScreen` vs HTML `renderMonitoringPage`

| HTML has | RN status |
| --- | --- |
| Segments: Workers, Employees | Missing; RN uses LC Tasks/All. |
| Stat cards: Pending, In progress, Revoked, Completed | Missing. |
| Task list filtered by worker/employee audience | Missing because worker/employee task audiences are absent. |
| Manager action: Drill down | Replaced with complete/revoke/review actions. |

### `BranchManagerIssuesScreen` vs HTML `renderManagerIssuesPage`

| HTML has | RN status |
| --- | --- |
| Header title “Escalated issues and actions” and workflow copy | Simplified as “Issues & Complaints”. |
| Create work order CTA (`openForm('expense')`) | Missing. |
| Role-aware complaint actions: assign vendor for escalated issues | Partially missing; RN offers resolve/escalate, not assign vendor in this screen. |

### `BranchManagerVisitsScreen` vs HTML `renderVisitsPage`

| HTML has | RN status |
| --- | --- |
| Inline “Schedule a new visit” form | Missing; RN only lists visits and has search/date filters. |
| Schedule visit CTA in section header | Missing. |
| Two-column layout: schedule form + visit cards | Missing. |
| Visit cards with scheduled, agenda, report, open detail, submit report | Partially present. |

### `RmDashboardScreen` vs HTML `renderRmDashboard`

| HTML has | RN status |
| --- | --- |
| Section subtitle and actions: Open approvals, User control | Missing from RN dashboard header. |
| Four stat cards: Branch health, Attendance average, Critical alerts, Open approvals | Missing; RN uses shortcut tiles. |
| Branch health board listing every branch with health, attendance, SLA, budget used, audit badge, critical badge | Missing; RN only shows top performing branches with fewer fields. |
| Open intelligence CTA | Missing. |
| RM watchlist | Missing. |
| Decision feed | Missing. |

### `RmIntelligenceScreen` / `BranchesScreen` vs HTML `renderRmIntelligence`

| HTML has | RN status |
| --- | --- |
| Branch intelligence cards with performance/risk segment | Mostly present through shared `BranchesScreen`. |
| Per-branch progress bar based on selected performance/risk metric | Partially present; RN branch cards show more directory-style metrics and not exactly the HTML intelligence card structure. |
| Overview and Deep Dive buttons | Present. |

### `RmAlertsScreen` vs HTML `renderRmAlerts`

| HTML has | RN status |
| --- | --- |
| Alert center based on critical/escalated complaints | Missing/reinterpreted; RN uses notifications, not complaint cards. |
| Repeated failure watch section | Missing. |
| Segments Critical/All | RN adds Warning/Info and filters notifications, not complaints. |

### `RmFinanceScreen` vs HTML `renderRmFinance`

| HTML has | RN status |
| --- | --- |
| Stat cards: High-cost issues, Pending approvals, Regional budget burn | Missing. |
| High-cost repair/complaint cards | Missing; RN focuses on branch budget usage and pending financial approvals. |
| Issues and expenses decision context | Partially present as budget/approval view, but high-cost issue workflow is absent. |

### `RmAnalyticsScreen` vs HTML `renderRmAnalytics`

| HTML has | RN status |
| --- | --- |
| Two simple trend panels: Attendance trend and Expense pressure | Missing/replaced with broader analytics cards, branch comparison, and key insights. |
| Expense pressure bars matching budget burn thresholds | Partially present in `RmFinanceScreen`, not this screen. |

### `RmUsersScreen` vs HTML `renderRmUsers`

| HTML has | RN status |
| --- | --- |
| Segments: Active, Workers, All | Missing exact workers bucket; RN uses Active/Inactive/All plus role chips. |
| Create user form with role options Worker, Employee, Admin Assistant, Manager | Partially present but invalid against `RoleId`; modal form only allows `lc` and `branchManager`, screen-local form casts unsupported roles with `as any`. |
| User list can include worker/employee/admin assistant/manager roles | Missing because RN mock users are only `rm`, `branchManager`, and `lc`. |
| Refresh permissions action | Missing. |

### `RmSettingsScreen` vs HTML `renderRmSettings`

| HTML has | RN status |
| --- | --- |
| Single update form for geo radius, worker escalation mins, employee escalation mins, critical alert rule, deadline rule | Partially present but reorganized into larger settings sections. |
| Worker/employee escalation minutes as explicit fields | Missing as dedicated numeric settings; RN has a generic `escalationTimeout` string. |
| Current policy snapshot including worker and employee escalation | Partially present through sections, but not the HTML snapshot. |
| Why this matters panel | Missing. |

## Missing UI Components/Features

- **Desktop sidebar / responsive shell**: HTML has a persistent desktop sidebar and separate mobile nav. RN only uses top bar + bottom tabs.
- **Deep branch hub entry flow**: HTML can set a selected branch and enter `branch` page from manager/RM branch cards. RN has modals/deep-dive components but no equivalent app-level branch hub route/state for managers.
- **Inline forms within screens**:
  - Quick complaint form exists in RN LC complaints, but worker/employee complaint pages are missing.
  - Visit scheduler inline form is missing from Branch Manager visits.
  - Settings single inline rule form is missing/restructured.
- **Logo in top bar**: HTML top bar includes `logo.png`; RN top bar has no Bajaj logo.
- **Avatar with initials in top bar**: HTML shows initials in a gradient avatar. RN shows a generic user icon.
- **Role switcher coverage**: RN switcher cannot expose Worker, Employee, or AA because `ROLES` lacks those roles.
- **Audit trail visualization**: RN has an audit modal, but it is session-generated/default-only. HTML also uses branch audit trail inside Branch Hub and fixed audit entries in the audit modal.
- **Branch compliance visualization**: Missing from RN branch hub/screens.
- **Proof escalation ladder**: Missing worker home component.
- **Countdown focus card**: Missing worker home component.
- **Redo watch**: Missing employee home component.
- **Staff pulse**: Missing LC/AA home component.
- **Manager watchlist / RM watchlist / decision feed**: Missing from existing RN dashboards.
- **Repeated failure watch**: Missing from RM alerts.
- **Template task cards**: Missing from LC/AA task control.
- **Permission refresh action**: Missing from RM user management.
- **Bajaj logo/branding asset usage**: HTML explicitly references a logo; RN does not.

## Missing Data

- **Role data**:
  - `worker`, `employee`, `aa`, and HTML `manager` role ids are absent from `RoleId`.
  - `ROLES` lacks Worker, Employee, AA, and exact `manager` entries.
  - `currentUserByRole` lacks Worker, Employee, AA, and Manager mappings.
- **User data by role**:
  - RN mock users do not include valid `worker`, `employee`, or `aa` users.
  - HTML staff concepts such as workers, employees, and admin assistants cannot populate staff pulse, branch workers/employees tabs, or RM worker filters.
- **Task audience data**:
  - HTML uses task audiences `worker` and `employee` for branch execution flows.
  - RN `Task.audience` is typed as `RoleId`, so worker/employee tasks cannot be represented without changing the type.
- **Notification scopes**:
  - HTML notifications target `worker`, `employee`, `am`/AA, `manager`, and `rm`.
  - RN notification scopes can only target current `RoleId` values.
- **Branch data fields**:
  - HTML branches include `employeeCount`; RN `Branch` type has `workerCount` but no `employeeCount`.
  - HTML branch hub stats and branch detail copy rely on worker/employee counts.
- **Audit trail data**:
  - HTML references branch-specific audit trail entries for Branch Hub Audit tab.
  - RN has only session `auditLog` plus generic defaults; no persisted branch-level `auditTrail` mock array.
- **Settings data**:
  - HTML has `workerEscalationMins` and `employeeEscalationMins` as distinct values.
  - RN has `escalationTimeout` but not separate worker/employee numeric settings.
- **Selected branch state**:
  - HTML uses `selectedBranchId` to enter a branch hub from manager/RM branch cards.
  - RN app state has no equivalent.
- **Role-specific current user seed data**:
  - HTML seeds current users for worker, employee, aa/lc, manager, and rm.
  - RN seeds only lc, branchManager, and rm.

## Missing User Flows

- Switch into Worker and operate as a worker.
- Switch into Employee and operate as an employee.
- Switch into AA independently from LC.
- Worker submits proof from a worker task board.
- Employee marks completion and receives/acts on revoked task redo notes.
- Worker/employee attendance proof page with month records.
- Branch lead manages worker vs employee task flows and templates.
- Branch lead reviews worker/employee staff cards from Branch Hub.
- Branch lead opens Branch Hub audit/compliance tab.
- Manager monitors worker and employee execution separately.
- Manager creates a work order from escalated issues.
- Manager schedules a visit from an inline visit planner.
- Manager drills into a selected branch hub.
- RM reviews alerts as critical/escalated issue cards plus repeated failure watch.
- RM creates Worker/Employee/Admin Assistant/Manager users with valid role types.
- RM refreshes permissions for a user.
- RM reviews dashboard decision feed and RM watchlist.

## Next Steps

1. **Expand domain model first**: update `RoleId`, `ROLES`, `currentUserByRole`, `User.role`, `Task.audience`, `NotificationItem.scope`, and `TabState` to support Worker, Employee, AA, Manager, and RM-compatible scopes.
2. **Add missing seed data**: add worker/employee/AA users, worker/employee tasks, role-scoped notifications, `employeeCount`, branch audit trail, and separate worker/employee escalation settings.
3. **Create missing role navigators/screens**: implement Worker, Employee, and AA screen sets or shared role-aware screen components.
4. **Rebuild LC/AA branch lead flows**: action queue, templates, staff pulse, branch watchlist, branch hub workers/employees/appliances/audit.
5. **Rebuild dashboard compositions**: restore the HTML stat cards, watchlists, branch health boards, decision feed, and upcoming visits sections for LC, Manager, and RM.
6. **Implement manager branch hub state**: add selected branch state and a branch hub route/page that works for manager/RM drill-downs.
7. **Fill missing inline forms/actions**: visit scheduler, create work order, permission refresh, worker/employee task actions, settings rule form.
8. **Then address visual parity**: once missing roles/flows/data exist, revisit typography, shell, cards, and responsive layout from the prior UI review.
