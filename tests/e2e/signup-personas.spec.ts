import { test, expect } from '@playwright/test';

test('institute signup → /dashboard', async ({ page }) => {
  const email = `e2e-inst-${Date.now()}@e.com`;
  await page.goto('/signup');
  await page.fill('input[name="name"]', 'E2E Institute');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="instituteName"]', 'E2E School');
  await page.fill('input[name="phone"]', '9999999999');
  await page.fill('input[name="contactPerson"]', 'E2E Contact');
  await page.fill('input[name="street"]', '1 Test St');
  await page.fill('input[name="city"]', 'Bengaluru');
  await page.fill('input[name="state"]', 'KA');
  await page.fill('input[name="pincode"]', '560001');
  await page.fill('input[name="password"]', 'password123');
  await page.fill('input[name="confirmPassword"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('teacher signup → /teacher/dashboard', async ({ page }) => {
  const email = `e2e-teach-${Date.now()}@e.com`;
  await page.goto('/teacher/signup');
  await page.fill('input[name="name"]', 'E2E Teacher');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'password123');
  // confirmPassword is a standalone state field (id="confirmPassword", name="confirmPassword")
  await page.fill('input[id="confirmPassword"]', 'password123');
  await page.fill('input[name="phone"]', '9999999998');
  await page.fill('input[name="location"]', 'Bengaluru, Karnataka');
  await page.fill('input[name="experience"]', '5');
  // Qualification: input id="qualifications" — fill and press Enter to add tag
  await page.fill('input[id="qualifications"]', 'M.Sc.');
  await page.press('input[id="qualifications"]', 'Enter');
  // Subject: input id="subjects" — fill and press Enter to add tag
  await page.fill('input[id="subjects"]', 'Mathematics');
  await page.press('input[id="subjects"]', 'Enter');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/teacher/dashboard', { timeout: 15000 });
  await expect(page).toHaveURL(/\/teacher\/dashboard$/);
});

test('vendor signup → /dashboard', async ({ page }) => {
  const email = `e2e-vend-${Date.now()}@e.com`;
  await page.goto('/vendor/signup');
  await page.fill('input[name="name"]', 'E2E Vendor Contact');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'password123');
  await page.fill('input[name="confirmPassword"]', 'password123');
  await page.fill('input[name="phone"]', '9999999997').catch(() => {});
  await page.fill('input[name="businessName"]', 'E2E Vendor Pvt Ltd');
  await page.fill('input[name="contactPerson"]', 'E2E Contact').catch(() => {});
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await expect(page).toHaveURL(/\/dashboard$/);
});
