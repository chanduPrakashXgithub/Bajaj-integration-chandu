# Code Review Summary

**Scope**: Code quality review of `src/roles/lc/LcBranchScreen.tsx` and `src/data/mockData.ts`
**Overall risk**: Medium
**Verdict**: Approve with comments

## Findings

### [P2] Medium

- **Copy-paste with slight variation: `WorkersTab` vs `EmployeesTab`**
  - **Location**: `src/roles/lc/LcBranchScreen.tsx:200-305` (WorkersTab) and `src/roles/lc/LcBranchScreen.tsx:310-415` (EmployeesTab)
  - **Why it matters**: These two components are ~110 lines each and share identical structure: empty state, Card wrapper, TouchableOpacity, header row (avatar + name + position + badge), metric tiles, and footer with Profile/Phone buttons. The only differences are: (1) icon/color in avatar (`Users`/`slate100` vs `UserCheck`/`emerald50`), (2) metric labels and values, (3) footer left text (`Shift` vs `Last check-in`). Any bug fix or style change must be duplicated in both places.
  - **Evidence**: Both components have the exact same prop signature `(items: User[], onUserPress: (id: number) => void)`, identical Card/TouchableOpacity nesting, and identical footer JSX (lines 275-299 vs 385-409).
  - **Fix**: Extract a shared `StaffCard` component parameterized by variant config:
    ```tsx
    type StaffVariant = {
      icon: LucideIcon;
      iconBg: string;
      iconColor: string;
      metrics: { label: string; value: string }[];
      footerLabel: string;
    };

    function StaffCard({ user, variant, onUserPress }: { user: User; variant: StaffVariant; onUserPress: (id: number) => void }) {
      // Single implementation
    }
    ```
    Then `WorkersTab` and `EmployeesTab` each become a thin wrapper that maps data and calls `StaffCard`.

- **Hardcoded compliance value `"98.2%"` in AuditTab**
  - **Location**: `src/roles/lc/LcBranchScreen.tsx:607`
  - **Why it matters**: The "Proof Task Rate" row in Branch Compliance renders `98.2%` as a string literal. Every other compliance metric on the same screen is data-driven (`branch.todayAttendance`, `branch.criticalAlerts`, `branch.auditScore`). This hardcoded value will silently become stale once real data is available, creating a misleading dashboard.
  - **Evidence**: Compare line 597 (`{formatPct(branch.todayAttendance)}` — dynamic) vs line 607 (`98.2%` — static). This is a code smell / mock-data leak.
  - **Fix**: Source from branch data, e.g. `branch.proofTaskRate` or compute from attendance records:
    ```tsx
    <Text ...>{formatPct(branch.proofTaskRate)}</Text>
    ```

### [P3] Low

- **`workerSkills` array recreated on every `isWorkerLike` call**
  - **Location**: `src/roles/lc/LcBranchScreen.tsx:34`
  - **Why it matters**: `isWorkerLike` is called once per staff member (currently via two `useMemo`s — see below). Each invocation allocates a new 5-element `workerSkills` array. This is wasteful because the array is a fixed constant.
  - **Evidence**: The array `["Patrol", "Equipment check", "Fire safety", "Housekeeping", "Cleaning"]` never changes.
  - **Fix**: Move to module scope:
    ```tsx
    const WORKER_SKILLS = ["Patrol", "Equipment check", "Fire safety", "Housekeeping", "Cleaning"];

    function isWorkerLike(user: User): boolean {
      return user.skills.some((s) => WORKER_SKILLS.includes(s)) || user.salary < 30000;
    }
    ```

- **`fabConfig` object recreated every render**
  - **Location**: `src/roles/lc/LcBranchScreen.tsx:91-96`
  - **Why it matters**: The `fabConfig` object is a static mapping from tab name to label/formType. It is recreated on every render of `LcBranchScreen`. This is a trivial allocation, but it's a constant that belongs at module scope alongside `BRANCH_TABS`.
  - **Evidence**: The object's content never changes — it depends on no props or state.
  - **Fix**: Move to module scope:
    ```tsx
    const FAB_CONFIG: Record<string, { label: string; formType: string }> = {
      workers: { label: "Add Worker", formType: "staff" },
      employees: { label: "Add Employee", formType: "staff" },
      appliances: { label: "Add Appliance", formType: "appliance" },
      audit: { label: "Audit Trail", formType: "audit" },
    };
    ```

- **Unnecessary JSX section-header comments**
  - **Location**: `src/roles/lc/LcBranchScreen.tsx:101, 130, 170` and throughout sub-components
  - **Why it matters**: Comments like `{/* ── Section Header ── */}`, `{/* ── 4 Mini Stat Cards ── */}`, `{/* ── Tab Content ── */}`, `{/* Header row: avatar + status */}`, `{/* Metric tiles */}`, `{/* Footer */}` are purely decorative. They describe what the next JSX element *is* (which is already obvious from the code), not *why* it exists. They add visual noise without documenting non-obvious behavior, edge cases, or rationale.
  - **Evidence**: Line 101 `{/* ── Section Header ── */}` sits directly above `<SectionHeader ...>` — the component name already conveys this. Same pattern at lines 130, 170, 225, 247, 275, 335, 357, 385, etc.
  - **Fix**: Remove decorative comments. Keep comments only where they explain non-obvious logic (e.g., the `isWorkerLike` JSDoc at line 27-32 is fine because it documents a heuristic decision).

- **`scopedComplaints.filter` computed inline in JSX**
  - **Location**: `src/roles/lc/LcBranchScreen.tsx:189`
  - **Why it matters**: `scopedComplaints.filter((c) => c.branchId === branch.id)` creates a new array on every render, passed as a prop to `AuditTab`. Even when the tab is "workers", this filter runs. (Previously flagged in the efficiency review — still applies to the code quality concern of redundant/inline computation.)
  - **Fix**: Memoize alongside the other branch-scoped data at lines 62-86.

### `mockData.ts`

No code quality issues. The only change is a trivial default tab value swap (`lcBranch: "workers"` instead of `"appliances"`), which is consistent with the new tab structure in `LcBranchScreen`.

## Suggested Next Steps

- [ ] Extract shared `StaffCard` from `WorkersTab`/`EmployeesTab` — highest maintainability impact
- [ ] Replace hardcoded `"98.2%"` with data-driven value
- [ ] Move `WORKER_SKILLS` and `FAB_CONFIG` to module scope
- [ ] Remove decorative JSX comments
