const { test, describe, beforeEach, expect } = require("@playwright/test");

describe('Blog App', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/');
  })
  test('Front Page Loads', async ({ page }) => {
    await expect(page.getByText('blogs')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  })
  test('Login Form can be Toggled', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Login to Application')).toBeVisible();

    await expect(page.getByText('Username:')).toBeVisible();
    await expect(page.getByTestId('username')).toBeVisible();

    await expect(page.getByText('Password:')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });
});
