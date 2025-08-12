import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4242/');
  await page.getByRole('textbox', { name: 'Destination' }).click();
  await page.getByRole('textbox', { name: 'Destination' }).fill('Singapore');
  await page.getByText('Singapore, Singapore', { exact: true }).click();
  await page.getByRole('button', { name: 'Search Hotels' }).click();
  await page.getByRole('link', { name: 'Holiday Inn Express Singapore' }).click();
  const card618 = page.locator('div')
  .filter({ hasText: /\$\s*618(?:[.,]\d{2})?\s*\/\s*night/i });
  await card618.getByRole('button', { name: /select/i }).first().click(); 
  await page.getByRole('button', { name: 'Confirm Booking' }).click();
  await page.getByRole('button', { name: 'Proceed to Payment' }).click();
});