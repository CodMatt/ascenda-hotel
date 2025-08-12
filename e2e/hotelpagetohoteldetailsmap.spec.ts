import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4242/');
  await page.getByRole('textbox', { name: 'Destination' }).click();
  await page.getByRole('textbox', { name: 'Destination' }).fill('Singapore');
  await page.getByText('Singapore, Singapore', { exact: true }).click();
  await page.getByRole('button', { name: 'Search Hotels' }).click();
  await page.locator('div:nth-child(45)').click();
  await page.getByRole('button', { name: 'Select' }).click();
  await page.getByRole('button', { name: 'View on Map' }).click();
});