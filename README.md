# eduFleet Exchange — UI

React + Vite frontend for the eduFleet Exchange platform.

## Stack

- React 19 + Vite 7 + TypeScript
- React Router 7
- Radix UI + shadcn/ui + Tailwind 3
- Axios (via `src/lib/apiClient.ts`)
- Vitest + Testing Library for unit tests

## Repo layout

- `src/api/` — API services + types
- `src/api/types.ts` — `Account`, persona `Profile` union, `Subscription`, `AuthBundle`, request shapes
- `src/api/services/` — One file per resource (authService, teacherService, vehicleService, etc.)
- `src/components/` — Reusable UI components
- `src/context/` — React contexts (Auth, Notification, Ad, Config)
- `src/hooks/` — Custom hooks
- `src/pages/` — Route pages (one per route)
- `src/lib/` — API client + utils
- `src/types/profileGuards.ts` — Narrow helpers (`isInstituteProfile`, `isTeacherProfile`, etc.)

## Architecture: account / profile / subscription

`useAuth()` returns:
- `account` — identity (`Account | null`)
- `profile` — persona-specific data (`InstituteProfile | TeacherProfile | VendorProfile | StaffProfile | null`)
- `subscription` — quota + status (`Subscription | null`)

Plus methods: `login`, `signupInstitute`, `signupTeacher`, `signupVendor`, `updateAccount`, `logout`, `refresh`. Legacy `user` alias and back-compat methods are still exposed during the migration window.

Use `isInstituteProfile(profile, account.role)` etc. when handling multiple personas in one component.

The canonical design doc lives in the server repo: `edufleetexchange/docs/superpowers/specs/2026-05-24-user-decomposition-design.md`. A pointer is at `docs/superpowers/specs/` in this repo.

## Run

```bash
npm install
cp .env.frontend.example .env   # set VITE_API_URL (default http://localhost:5000/api)
npm run dev                      # Vite dev server, default port 5173
npm test                         # run vitest
npm run lint                     # types + eslint + stylelint + css var/class checks
```

## Connecting to the server

Run `npm run dev` in the server repo first. The default `VITE_API_URL` matches the server's default port.

## Tests

```bash
npm test
```

3 tests cover `AuthContext` (unauthenticated start, login populates bundle, logout clears state). More tests will be added as pages are reworked.
