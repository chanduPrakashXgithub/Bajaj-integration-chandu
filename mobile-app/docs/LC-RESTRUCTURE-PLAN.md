# Location Controller (LC) Role — Restructure Plan

## Problem Statement

- Admin Assistant (AA) and Worker roles overlap — should be one unified role
- Worker role is **completely removed**, not absorbed
- LC assigns tasks to **himself** (no team management)
- Total dashboards after restructure: **LC, Branch Manager, Super Admin** (3 total)
- LC is scoped to a **single branch**

---

## What Changes

| Before | After |
|--------|-------|
| Worker (`worker` role) | **Deleted** — gone entirely |
| Admin Assistant (`am` role) | **Renamed to Location Controller (`lc`)** |
| LC scope | **Single branch** |
| AA managed workers | LC **self-assigns** tasks, no worker management |

**Branch Manager** and **Regional Manager** stay unchanged.

---

## New LC Role Definition

```
RoleId: "lc"
Name: "Location Controller"
Description: "Branch operations lead"
Accent: bg-emerald-500 (keep AA's green)
Hierarchy: LC → Branch Manager → RM
Branch Scope: Single branch
Task Model: Self-assign — LC creates and assigns tasks to himself
```

---

## LC Screens (7 tabs)

| Tab | Screen Name | Source | Description |
|-----|-------------|--------|-------------|
| 1 | **Home** | Modified from AA | Branch health overview, quick actions (mark attendance, raise issue), pending tasks count |
| 2 | **Branch** | Modified from AA | Branch detail with sub-tabs (Appliances, Audit) — no Workers tab since workers don't exist |
| 3 | **Tasks** | Modified from AA | Self-assigned task board. LC creates tasks, assigns to himself, submits proof, tracks status |
| 4 | **Attendance** | Rewritten | **Give own attendance** + **weekly task form** (input tasks planned for the week) |
| 5 | **Complaints** | Modified from AA | Raise, assign vendor, escalate, resolve complaints for the branch |
| 6 | **Notifications** | Kept from AA | Alerts scoped to LC's branch |
| 7 | **Profile** | Kept from AA | Own profile, skills, documents, audit trail |

**Tab bar shows first 5**: Home, Branch, Tasks, Attendance, Complaints
**Navigation-only (via setPage)**: Notifications, Profile

---

## Screens to DELETE

| File | Reason |
|------|--------|
| `src/roles/worker/WorkerHomeScreen.tsx` | Worker role deleted |
| `src/roles/worker/WorkerTasksScreen.tsx` | Worker role deleted |
| `src/roles/worker/WorkerComplaintsScreen.tsx` | Worker role deleted |
| `src/roles/worker/WorkerAttendanceScreen.tsx` | Worker role deleted |
| `src/roles/worker/WorkerNotificationsScreen.tsx` | Worker role deleted |
| `src/roles/worker/WorkerProfileScreen.tsx` | Worker role deleted |
| Entire `src/roles/worker/` directory | Deleted |

---

## Screens to MODIFY (AA → LC)

| File | Action |
|------|--------|
| `src/roles/am/AmHomeScreen.tsx` | **Modify** — remove worker/team management UI, keep branch health + quick actions |
| `src/roles/am/AmBranchScreen.tsx` | **Modify** — remove Workers sub-tab, keep Appliances + Audit only |
| `src/roles/am/AmTasksScreen.tsx` | **Modify** — change to self-assign model (LC creates task → assigns to self → submits proof) |
| `src/roles/am/AmComplaintsScreen.tsx` | **Modify** — keep raise/assign/escalate/resolve (remove worker-specific references) |
| `src/roles/am/AmAttendanceScreen.tsx` | **Rewrite** — own attendance + weekly task form (no team view) |
| `src/roles/am/AmNotificationsScreen.tsx` | **Rename** → LcNotificationsScreen |
| `src/roles/am/AmProfileScreen.tsx` | **Rename** → LcProfileScreen |

**Rename directory**: `src/roles/am/` → `src/roles/lc/`
**Rename files**: `Am*.tsx` → `Lc*.tsx`

---

## New Attendance Screen — Detailed Design

### Single view (no tabs, no team attendance):

- **Button**: "Mark Attendance" → opens form
- **Form fields**:
  1. Date (defaults to today)
  2. Check-in time (auto or manual)
  3. **Weekly Task Form** (form type):
     - Dynamic list of task rows
     - Each row: task description (text input), estimated hours (number)
     - Add/remove task rows (+ button)
     - Captures what the LC plans to do that week
  4. Check-out time (optional, filled later)
  5. Notes (optional)
- **Submit** → saves attendance record with embedded weekly tasks
- **Below form**: Attendance history list (own records only)

---

## Branch Screen — Updated Design

### Sub-tabs (2 only, no Workers tab):

| Tab | Content |
|-----|---------|
| **Appliances** | Asset status tracking with risk alerts (same as current) |
| **Audit** | Audit score, budget usage, branch info (same as current) |

---

## Task Screen — Self-Assign Model

### Flow:
1. LC creates a task (title, description, priority, due date)
2. Task is **auto-assigned to LC himself**
3. LC works on it and submits photo proof
4. Task goes to "Pending Review" status
5. Branch Manager can approve/reject

### Filters:
- All / Pending / In Progress / Completed / Under Review

---

## Data Model Changes

### In `src/types/domain.ts`:
```typescript
// Change RoleId — remove worker and am
export type RoleId = "lc" | "branchManager" | "rm";

// Add WeeklyTaskItem for attendance form
export interface WeeklyTaskItem {
  id: string;
  description: string;
  estimatedHours: number;
}

// Update Attendance type
export interface Attendance {
  // ... existing fields
  weeklyTasks?: WeeklyTaskItem[];
}
```

### In `src/data/mockData.ts`:
```typescript
// Remove ROLES.worker and ROLES.am completely
// Add ROLES.lc (based on AA properties, single branch)
// Update currentUserByRole: remove worker & am, add lc
// LC user keeps branchId (single branch)
```

### In `src/context/AppContext.tsx`:
```typescript
// Remove worker-specific filtering (t.audience === "worker")
// Remove AA's team management functions
// LC scoping stays as [currentUser.branchId] — no change needed
// Task functions: LC creates tasks assigned to self
```

---

## Files to Modify (Summary)

| File | Change |
|------|--------|
| `src/types/domain.ts` | RoleId: remove `worker`/`am`, add `lc`; add WeeklyTaskItem |
| `src/data/mockData.ts` | Remove worker/am roles, add lc role, update users |
| `src/context/AppContext.tsx` | Remove worker filtering, add self-assign task logic |
| `src/navigation/RootNavigator.tsx` | Remove worker/am registrations, add lc screens |
| `src/modals/forms/RoleSwitcherModal.tsx` | Show 3 roles: LC, BM, RM |
| `src/modals/forms/FormModal.tsx` | Add weekly task form type |
| `src/modals/detail/DetailModal.tsx` | Remove worker-specific display logic |
| `src/theme/styleMaps.ts` | Remove worker/am mappings, add lc |
| Entire `src/roles/lc/` (renamed from am) | Modify/rename all screens |

---

## Files to DELETE

```
src/roles/worker/  (entire directory — 6 files)
```

---

## Implementation Order

1. **Update types** — RoleId, add WeeklyTaskItem, update Attendance
2. **Update mock data** — Remove worker/am, add lc role
3. **Update context** — Remove worker logic, add self-assign task model
4. **Rename `am/` → `lc/`** — Rename directory and all files
5. **Modify LC screens** — Remove worker/team management, add self-assign
6. **Build new Attendance screen** — Own attendance + weekly task form
7. **Update Branch screen** — Remove Workers sub-tab
8. **Update Task screen** — Self-assign model
9. **Update navigation** — Register lc screens, remove old
10. **Update RoleSwitcherModal** — Show 3 roles
11. **Delete worker directory**
12. **Test all 3 roles** — LC self-assigns, BM/RM unchanged

---

## Role Switcher — Final State

| Role | Badge Color | Tabs |
|------|-------------|------|
| Location Controller | Green (emerald) | Home, Branch, Tasks, Attendance, Complaints + Notifications, Profile |
| Branch Manager | Teal | Overview, Branches, Task Monitor, Issues, Approvals + Visits, Notifications, Profile |
| Super Admin | Rose | Dashboard, Branch Intel, Alerts, Finance, Analytics + Approvals, Users, Settings, Notifications, Profile |
