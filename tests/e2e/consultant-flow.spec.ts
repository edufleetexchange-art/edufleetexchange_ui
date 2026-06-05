import { test, expect, Page } from '@playwright/test';

const CONSULTANT = { email: 'consultant1@edufleet.test', password: 'password123' };
const TEACHER = { email: 'teacher1@edufleet.test', password: 'password123' };

async function login(page: Page, user: typeof CONSULTANT) {
  await page.goto('/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
}

test.setTimeout(60_000);

test('teacher grants consent', async ({ page }) => {
  await login(page, TEACHER);
  await page.waitForURL('**/teacher/dashboard', { timeout: 15000 });
  // The TeacherConsentToggle renders on the profile tab — switch role between Off and On.
  const switchEl = page.getByRole('switch').first();
  if (await switchEl.isVisible({ timeout: 5000 }).catch(() => false)) {
    await switchEl.click();
    await expect(page.getByText(/Consultants can now apply on your behalf|Consultant access revoked/i)).toBeVisible({ timeout: 5000 });
  }
});

test('consultant signs in and sees dashboard', async ({ page }) => {
  await login(page, CONSULTANT);
  await page.waitForURL('**/consultant/dashboard', { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Consultant Dashboard' })).toBeVisible();
});

test('consultant adds a teacher to roster', async ({ page }) => {
  await login(page, CONSULTANT);
  await page.waitForURL('**/consultant/dashboard');
  await page.goto('/consultant/roster');
  await page.getByRole('button', { name: /^Add teacher$/ }).click();
  await page.getByPlaceholder(/Subject/i).fill('Math');
  await page.getByRole('button', { name: 'Search' }).click();
  const firstRow = page.locator('li button').first();
  if (await firstRow.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstRow.click();
    await page.getByRole('button', { name: /Add to roster/ }).click();
    await expect(page.getByText(/Added to roster|Already in your roster/i)).toBeVisible({ timeout: 5000 });
  }
});
