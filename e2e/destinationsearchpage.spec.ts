import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4242/');
  await page.getByRole('textbox', { name: 'Destination' }).click();
  await page.getByRole('textbox', { name: 'Destination' }).fill('Singapore,');
  await page.getByText('Singapore, Singapore', { exact: true }).click();
  await page.locator('div').filter({ hasText: /^Check-in\(Must be at least 3 days in advance\)$/ }).getByRole('textbox').click();
  await page.getByRole('option', { name: 'Choose Saturday, August 16th,' }).click();
  await page.locator('div').filter({ hasText: /^Check-out\(Placeholder to align height\)$/ }).getByRole('textbox').click();
  await page.getByRole('option', { name: 'Choose Monday, August 18th,' }).click();
  await page.getByRole('button', { name: '+' }).first().click();
  await page.getByRole('button', { name: '+ Add Room' }).click();
  await page.getByRole('button', { name: '+' }).nth(2).click();
  await page.getByRole('button', { name: 'Search Hotels' }).click();
  await page.getByRole('button', { name: '5-Star' }).click();
  await page.getByRole('button', { name: '4-Star' }).click();
  await page.getByRole('button', { name: '3-Star' }).click();
  await page.getByRole('button', { name: 'Clear Star' }).click();
  await page.getByRole('combobox').selectOption('priceAsc');
  await page.getByRole('combobox').selectOption('priceDesc');
  await page.getByRole('combobox').selectOption('starAsc');
  await page.getByRole('combobox').selectOption('starDesc');
});