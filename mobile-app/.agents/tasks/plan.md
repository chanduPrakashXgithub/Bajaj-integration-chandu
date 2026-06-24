# Plan: Restyle Modal Components to Match HTML Prototype — COMPLETED

## Objective

Restyle all modal components to match the HTML prototype's modal design patterns: bottom-sheet layout on phone, blur backdrop, proper radii, accent colors, and consistent form field styling.

## Summary of Changes

### New File Created

| File | Purpose |
|------|---------|
| `src/shared/components/ModalSheet.tsx` | Reusable bottom-sheet modal wrapper with blur backdrop, slide-up animation, drag handle |

### Files Updated

| File | Changes |
|------|---------|
| `src/modals/forms/RoleSwitcherModal.tsx` | Replaced `<Modal>` with `<ModalSheet>`, removed custom backdrop/animation |
| `src/modals/forms/SearchModal.tsx` | Replaced `<Modal>` with `<ModalSheet>`, updated search input styling |
| `src/modals/forms/FormModal.tsx` | Replaced `<Modal>` with `<ModalSheet>`, updated form fields, labels, and submit buttons |
| `src/modals/forms/EditProfileModal.tsx` | Replaced `<Modal>` with `<ModalSheet>`, updated input fields, labels, and save button |
| `src/modals/forms/AuditTrailModal.tsx` | Replaced `<Modal>` with `<ModalSheet>`, removed custom header |
| `src/modals/detail/DetailModal.tsx` | Replaced `<Modal>` with `<ModalSheet>`, removed custom header |

## Design System Applied

### ModalSheet Component
- **Backdrop:** `BlurView` with `intensity={12}`, `tint="dark"`
- **Position:** Bottom-sheet with `borderTopLeftRadius: 32`, `borderTopRightRadius: 32`
- **Animation:** Spring physics (`friction: 8`, `tension: 100`) for slide-up, timing for fade-in
- **Drag Handle:** 40×4 bar, `colors.slate300`, `borderRadius: 2`
- **Safe Area:** Bottom padding via `useSafeAreaInsets()`

### Form Fields
- **Background:** `colors.slate50`
- **Border Radius:** 14 (`borderRadius.md`)
- **Padding:** 14px horizontal, 12px vertical
- **Font:** `Manrope_400Regular` (`bodyFont`)

### Form Labels
- **Transform:** Uppercase
- **Weight:** Semibold (`fontWeight.semibold`)
- **Size:** XS (`fontSize.xs`)
- **Letter Spacing:** 1.2
- **Color:** `colors.slate400`

### Submit Buttons
- **Background:** `colors.slate900`
- **Height:** 48
- **Border Radius:** 14 (`borderRadius.md`)
- **Text:** White, semibold

## Verification

- **TypeScript:** 0 new errors (74 pre-existing errors in unrelated files)
- **Build:** ✅ `npx expo export --platform web --output-dir /tmp/expo-test` completed successfully
