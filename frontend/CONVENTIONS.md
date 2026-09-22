# Frontend conventions (read this before writing any module)

Stack: Vite + React 19 + TypeScript, React Router v7 (`react-router-dom`), TanStack Query v5, axios, MSW for the mock backend. Plain CSS (custom properties) — no UI kit, to match the mockup's bespoke look.

## Already built (do not modify unless fixing a genuine bug in it)

- `src/shared/theme/tokens.css`, `global.css` — design tokens (colors, spacing) extracted from the mockup. Use CSS variables (`var(--color-primary)` etc.), not hardcoded hex.
- `src/shared/api/client.ts` — the `api` axios instance. Import `{ api } from "../../shared/api/client"` and call `api.get/post/patch/put/delete(path, ...)`. Auth header + silent-refresh-on-401 already handled — never touch tokens yourself.
- `src/shared/api/types.ts` — `Page<T>` envelope type (every list endpoint returns this), `Role`, `AuthenticatedUser`.
- `src/shared/api/people.ts`, `src/shared/api/lawyers.ts` — base `Person`/`Lawyer` types + `listPeople`/`listLawyers`/`getPerson`/etc. The Pessoas/Advogados module builds its screens on top of these — do not redefine `Person`/`Lawyer` types elsewhere.
- `src/shared/pickers/PersonPicker.tsx`, `LawyerPicker.tsx` — typeahead combobox components for resolving a Person/Lawyer id to a display name. **Use these** in Lawsuits/Contracts/Documents forms instead of building your own picker — this was a cross-cutting concern explicitly deferred to be built once, shared.
- `src/shared/enums/labels.ts` — PT-BR label dictionaries for every backend enum (Court, Nature, Action, InitialOrganization, PositionClient, Rit, TypeContract, Role) plus `enumOptions(labels)` to turn a dictionary into `{value,label}[]` for a `<SelectField>`. **Never hardcode enum values or labels** — import from here.
- `src/shared/ui/` — `Button`, `TextField`/`SelectField`/`TextAreaField` (from `Field.tsx`), `Badge`, `Pagination`, `Modal`/`ConfirmDialog`, `LoadingState`/`EmptyState`/`ErrorState`/`ForbiddenState`. Use `className="card"`, `"card-header"`, `"card-title"`, `"filter-bar"`, `"filter-bar-row"`, `"toolbar"`, `"data-table"` (on a `<table>`), `"table-scroll"` from `src/shared/ui/ui.css` for layout — these classes match the mockup's visual patterns (flat cards, dense tables, filter bars above tables). Don't reinvent this CSS.
- `src/shared/hooks/usePagedQuery.ts` — standard list-screen pattern: `const { data, isLoading, isError, page, setPage, size } = usePagedQuery(["lawsuits", filters], filters, listLawsuits)`. `data` is a `Page<T>` when loaded. Use `<Pagination page={data} onPageChange={setPage} />`.
- `src/features/auth/AuthContext.tsx` — `useAuth()` gives `{ user, status, login, logout }`. `user.role` is `"ADMIN" | "USER" | "ACCOUNTING"`.
- `src/features/shell/*` — layout shell, sidebar, header, nav model. Don't touch.
- `src/app/router.tsx` — route tree already wired to a stub page per route. **Replace the stub component's contents; do not change the route paths** unless your spec requires a sub-route not yet in the tree (e.g. a modal route) — if so, add it and note it in your final report.
- `src/mocks/handlers.ts`, `fixtures.ts` — the mock backend. Endpoints already implement the contracts from the specs (`Page<T>` envelope, `/dashboard`, `/eventos`, document upload via `multipart/form-data`, contract extensions, etc.). **If your module needs a field the mock doesn't return, add it to the fixture + handler** (keep it consistent with the relevant spec's DTOs) rather than inventing data client-side.

## What each module owns

Build inside your own `src/features/<module>/` folder only. Files: `api.ts` (endpoint calls + types specific to your module, using `api` from shared/api/client — `Person`/`Lawyer` types come from shared, everything else is yours), plus one `.tsx` file per screen, replacing the matching stub named in `router.tsx`.

## Rules

- TypeScript strict — no `any`. Every API function has a typed request/response.
- Every list screen: `usePagedQuery` + `<Pagination>` + `LoadingState`/`EmptyState`/`ErrorState` for the three non-happy-path states.
- Every destructive action (delete) goes through `<ConfirmDialog>` — never a one-click delete.
- Every enum-driven `<select>` uses `enumOptions(XLabels)` from `shared/enums/labels.ts`.
- Match your spec's Acceptance Criteria one by one — they're your task list. Re-read your `.specs/features/<feature>/spec.md` before starting and check off each AC mentally as you implement it.
- Don't start a dev server (`npm run dev`) — other modules are being built in parallel and would collide on the port. Verify your work with:
  ```
  cd frontend && npx tsc -b --noEmit && npm run lint
  ```
  Both must be clean (lint: 0 errors; warnings are ok if pre-existing, but don't add new ones in your own files).
- Don't touch another module's files or the shared scaffold files listed above. If you find a genuine bug in a shared file (not just "I'd have designed it differently"), fix it minimally and say so in your report.
