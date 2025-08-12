import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4242/');
  await page.getByRole('button', { name: /register/i }).click();

  // 1) unique email so redirect actually happens
  const email = `e2e+${Date.now()}@example.com`;

  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByRole('textbox', { name: /password/i }).fill('TEST1234@t');
  await page.getByRole('textbox', { name: /phone number/i }).fill('93280872');
  await page.getByRole('textbox', { name: /first name/i }).fill('TEST');
  await page.getByRole('textbox', { name: /last name/i }).fill('USER');
  await page.locator('select[name="salutation"]').selectOption('Mr');

  const homeDestination = page.getByRole('textbox', { name: /destination/i });
  const searchHotelsBtn = page.getByRole('button', { name: /search hotels/i });

  // 2) single submit + wait for API success
  await Promise.all([
    page.getByRole('button', { name: /create account/i }).click(),
    page.waitForResponse(r =>
      /\/api\/(auth|users)\/(signup|register)/i.test(r.url()) && r.ok()
    ),
  ]);

  // 3) wait for home UI (pick either sentinel)
  await Promise.all([
    homeDestination.waitFor({ state: 'visible', timeout: 20000 }),
    searchHotelsBtn.waitFor({ state: 'visible', timeout: 20000 }),
  ]);

  // proceed…
  await expect(homeDestination).toBeVisible();

  await Promise.all([
    page.getByRole('button', { name: /logout/i }).click(),
    page.getByRole('button', { name: /sign in/i }).waitFor(),
  ]);

  await page.getByRole('button', { name: /sign in/i }).click();
  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByRole('textbox', { name: /password/i }).fill('TEST1234@t');
  await Promise.all([
    page.getByRole('button', { name: /login/i }).click(),
    page.getByRole('button', { name: /logout/i }).waitFor(),
  ]);

  await Promise.all([
    page.getByRole('button', { name: /logout/i }).click(),
    page.getByRole('button', { name: /sign in/i }).waitFor(),
  ]);
});
