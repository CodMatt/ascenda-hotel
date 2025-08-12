import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4242/');
  await page.getByRole('textbox', { name: 'Destination' }).click();
  await page.getByRole('textbox', { name: 'Destination' }).fill('Singapore,');
  await page.getByText('Singapore, Singapore', { exact: true }).click();
  await page.getByRole('button', { name: 'Search Hotels' }).click();
  await page.getByRole('link', { name: 'Holiday Inn Express Singapore' }).click();
  await page.getByRole('button', { name: '›' }).click();
  await page.getByRole('button', { name: '›' }).click();
  await page.getByRole('button', { name: '›' }).click();
  await page.getByRole('button', { name: '›' }).click();
  await page.getByRole('button', { name: '‹' }).click();
  await page.getByRole('button', { name: '‹' }).click();
  await page.getByRole('button', { name: 'See Room Options' }).click();
  const card618 = page.locator('div')
  .filter({ hasText: /\$\s*618(?:[.,]\d{2})?\s*\/\s*night/i });

  await card618.getByRole('button', { name: /select/i }).first().click();  
  await page.getByRole('button', { name: 'Confirm Booking' }).click();
  await page.locator('select[name="salutation"]').selectOption('Mr');
  await page.getByRole('textbox', { name: 'First Name' }).click();
  await page.getByRole('textbox', { name: 'First Name' }).fill('JavierC');
  await page.getByRole('textbox', { name: 'Last Name' }).click();
  await page.getByRole('textbox', { name: 'Last Name' }).fill('');
  await page.getByRole('textbox', { name: 'First Name' }).click();
  await page.getByRole('textbox', { name: 'First Name' }).fill('Javier');
  await page.getByText('Last Name').click();
  await page.getByRole('textbox', { name: 'Last Name' }).click();
  await page.getByRole('textbox', { name: 'Last Name' }).fill('Chan');
  await page.locator('select[name="phoneCode"]').selectOption('Singapore');
  await page.getByRole('textbox', { name: 'Phone Number' }).click();
  await page.getByRole('textbox', { name: 'Phone Number' }).fill('93280872');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('javiercjw1@gmail.coma');
  await page.getByRole('textbox', { name: 'Special Request (max: 150' }).click();
  await page.getByRole('textbox', { name: 'Special Request (max: 150' }).fill('bca');
  await page.getByRole('button', { name: 'Proceed to Payment' }).click();
});