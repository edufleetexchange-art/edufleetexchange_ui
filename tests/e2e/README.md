# E2E Tests

Run all tests:
```bash
# Prerequisites (in separate terminals):
#   1. MongoDB running on :27017
#   2. Server: cd ../edufleetexchange/server && npm run seed:reset && npm run dev
#   3. UI:    cd .. && npm run dev (must be on :3000)

cd edufleetexchange_ui
npx playwright test
```

Run a single test file:
```bash
npx playwright test tests/e2e/login-personas.spec.ts
```

Open the Playwright UI for debugging:
```bash
npx playwright test --ui
```

## Seeded credentials (password: `password123`)

| Email | Role | Lands at |
|---|---|---|
| admin@edufleet.test | admin | /admin |
| institute1@edufleet.test | institute | /dashboard |
| teacher1@edufleet.test | teacher | /teacher/dashboard |
| vendor1@edufleet.test | vendor | /dashboard |
| marketing1@edufleet.test | marketing | /marketing/dashboard |
| sales1@edufleet.test | sales | /sales/dashboard |
