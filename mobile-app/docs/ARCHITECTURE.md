# Bajaj Operations App Architecture

## Goals
- Convert the HTML prototype into a production-ready Expo app.
- Keep role-based UX (Worker, Employee, AM, Branch Manager, RM).
- Prepare for Node.js backend integration with minimal refactor.
- Keep EAS build and OTA update compatibility from day one.

## Tech Stack
- Expo SDK 56 (TypeScript)
- React Native (functional components)
- `@tanstack/react-query` for server state
- `axios` for API client
- `zod` for runtime validation
- Expo-native packages installed via `npx expo install`

## Folder Split
```
mobile-app/
  App.tsx
  docs/
    ARCHITECTURE.md
  src/
    app/
      RootApp.tsx
    components/
      layout/
        AppHeader.tsx
        BottomNav.tsx
      shared/
        Panel.tsx
        StatCard.tsx
    constants/
      roles.ts
      theme.ts
    data/
      mockData.ts
    features/
      operations/
        OperationsScreen.tsx
    services/
      api/
        client.ts
    state/
      useOpsStore.ts
    types/
      domain.ts
```

## Module Responsibilities
- `types/`: domain models for roles, tasks, complaints, approvals, notifications.
- `constants/`: static app config (theme, role pages, labels).
- `data/mockData.ts`: local mock datasets used before backend is live.
- `state/useOpsStore.ts`: app-level business state and actions.
- `services/api/`: HTTP client, auth headers, and future API methods.
- `features/operations/`: role-aware screen composition and feature logic.
- `components/`: reusable UI building blocks.
- `app/RootApp.tsx`: top-level app composition and safe area shell.

## Feature Decomposition Plan
- **Phase 1 (current):** Role switching, page switching, tasks, complaints, approvals, notifications, branch snapshot.
- **Phase 2:** Split each page into dedicated feature modules:
  - `features/tasks/`
  - `features/complaints/`
  - `features/attendance/`
  - `features/approvals/`
  - `features/analytics/`
- **Phase 3:** Replace mock data with API-backed repositories and query hooks.

## Backend Integration Contract
- `GET /me` -> current user, role, branch scope
- `GET /dashboard` -> aggregated metrics by role scope
- `GET /tasks`, `PATCH /tasks/:id`
- `GET /complaints`, `PATCH /complaints/:id`
- `GET /approvals`, `PATCH /approvals/:id`
- `GET /notifications`, `PATCH /notifications/:id`

All payloads should be validated with `zod` schemas before UI consumption.

## OTA + EAS Considerations
- Keep `newArchEnabled: true`.
- Keep update policies in `app.json`.
- Add environment isolation by EAS profile (`development`, `preview`, `production`).
- Ship API base URL via `EXPO_PUBLIC_API_URL`.

## Implementation Workflow
1. Build and verify feature parity using mock data.
2. Split large screens into feature slices when each module exceeds ~250 lines.
3. Add API services + React Query hooks.
4. Add auth, persistence, and route guards.
5. Final pass for EAS build and OTA update branch strategy.
