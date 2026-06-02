/**
 * Visual smoke harness — captures screenshots of each major surface at
 * 3 viewport widths so a human can scan responsive behaviour without
 * actually clicking through 6 personas.
 *
 * Screenshots land under: test-results/visual-smoke/<viewport>/<surface>.png
 *
 * Run with:   npx playwright test tests/e2e/visual-smoke.spec.ts --reporter=line
 * Then open:  test-results/visual-smoke/360x800/ etc.
 *
 * Assumes the dev DB is seeded with the standard 6 personas
 * (run `npm run seed:reset` in the server repo first).
 */

import { test, expect, type Page } from '@playwright/test';

const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800, label: 'phone' },
  { name: '768x1024', width: 768, height: 1024, label: 'tablet' },
  { name: '1280x800', width: 1280, height: 800, label: 'desktop' },
];

const PERSONAS = {
  institute: { email: 'institute1@edufleet.test', password: 'password123', dashboard: '/dashboard' },
  teacher: { email: 'teacher1@edufleet.test', password: 'password123', dashboard: '/teacher/dashboard' },
  marketing: { email: 'marketing1@edufleet.test', password: 'password123', dashboard: '/marketing/dashboard' },
  admin: { email: 'admin@edufleet.test', password: 'password123', dashboard: '/admin', loginPath: '/admin/login' },
};

async function loginAs(page: Page, persona: typeof PERSONAS[keyof typeof PERSONAS]) {
  const path = (persona as any).loginPath ?? '/login';
  await page.goto(path);
  await page.fill('input[type="email"]', persona.email);
  await page.fill('input[type="password"]', persona.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`**${persona.dashboard}`, { timeout: 15000 });
}

async function snap(page: Page, viewport: typeof VIEWPORTS[number], surface: string) {
  // domcontentloaded is much faster than networkidle and good enough for a visual smoke.
  // The fixed wait below covers most animation/fetch settling without depending on a
  // global network-quiet condition that some dashboards (with polling) never reach.
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `test-results/visual-smoke/${viewport.name}/${surface}.png`,
    fullPage: true,
  });
}

// Give dashboards extra runway — they may load many widgets / fire many fetches.
test.setTimeout(60_000);

for (const viewport of VIEWPORTS) {
  test.describe(`viewport ${viewport.name} (${viewport.label})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('public surfaces', async ({ page }) => {
      await page.goto('/');
      await snap(page, viewport, '01-landing');

      await page.goto('/login');
      await snap(page, viewport, '02-login');

      await page.goto('/signup');
      await snap(page, viewport, '03-signup-institute');

      await page.goto('/teacher/signup');
      await snap(page, viewport, '04-signup-teacher');

      await page.goto('/vendor/signup');
      await snap(page, viewport, '05-signup-vendor');

      await page.goto('/browse');
      await snap(page, viewport, '06-browse-vehicles');

      await page.goto('/jobs');
      await snap(page, viewport, '07-browse-jobs');

      await page.goto('/suppliers');
      await snap(page, viewport, '08-browse-suppliers');

      await page.goto('/forgot-password');
      await snap(page, viewport, '09-forgot-password');
    });

    test('institute dashboard', async ({ page }) => {
      await loginAs(page, PERSONAS.institute);
      await snap(page, viewport, '20-institute-dashboard');
    });

    test('teacher dashboard', async ({ page }) => {
      await loginAs(page, PERSONAS.teacher);
      await snap(page, viewport, '21-teacher-dashboard');
    });

    test('marketing dashboard', async ({ page }) => {
      await loginAs(page, PERSONAS.marketing);
      await snap(page, viewport, '22-marketing-dashboard');
    });

    test('admin overview', async ({ page }) => {
      await loginAs(page, PERSONAS.admin);
      await snap(page, viewport, '23-admin-overview');
    });
  });
}
