import { test, expect, Page } from '@playwright/test';

async function loginViaForm(page: Page, email: string, password: string, loginPath = '/login') {
  await page.goto(loginPath);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

test.describe('login-personas — golden path for each seeded role', () => {
  test('institute logs in and lands on /dashboard', async ({ page }) => {
    await loginViaForm(page, 'institute1@edufleet.test', 'password123');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('teacher logs in and lands on /teacher/dashboard', async ({ page }) => {
    await loginViaForm(page, 'teacher1@edufleet.test', 'password123');
    await page.waitForURL('**/teacher/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/\/teacher\/dashboard$/);
  });

  test('vendor logs in and lands on /dashboard', async ({ page }) => {
    await loginViaForm(page, 'vendor1@edufleet.test', 'password123');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('marketing logs in and lands on /marketing/dashboard', async ({ page }) => {
    await loginViaForm(page, 'marketing1@edufleet.test', 'password123');
    await page.waitForURL('**/marketing/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/\/marketing\/dashboard$/);
  });

  test('sales logs in and lands on /sales/dashboard', async ({ page }) => {
    await loginViaForm(page, 'sales1@edufleet.test', 'password123');
    await page.waitForURL('**/sales/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/\/sales\/dashboard$/);
  });

  test('admin logs in via /admin/login and lands on /admin', async ({ page }) => {
    await loginViaForm(page, 'admin@edufleet.test', 'password123', '/admin/login');
    await page.waitForURL('**/admin', { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin$/);
  });
});

test('bad password shows error and stays on login', async ({ page }) => {
  await loginViaForm(page, 'institute1@edufleet.test', 'wrong-pass');
  // Wait a moment for the toast/error to appear
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/login/);
});
