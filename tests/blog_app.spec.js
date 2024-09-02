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
  })
  describe('Login', async () => {
    beforeEach(async ({ page, request }) => {
      await request.post('/api/testing/reset');
      await request.post('/api/users', {
        data: {
          username: 'test',
          name: 'tester',
          password: 'secret',
        }
      });
    })
    test('Succeeds with valid Credentials', async ({ page }) => {
      await page.getByRole('button', { name: 'Login' }).click();

      await page.getByTestId('username').fill('test');
      await page.getByTestId('password').fill('secret');

      await page.getByTestId('login').click();

      await expect(page.getByText('tester has Logged In')).toBeVisible();
      await expect(page.getByText('tester has Logged In')).toHaveCSS('border-color', 'rgb(0, 128, 0)');
    })
    test('Fails with invalid Credentials', async ({ page }) => {
      await page.getByRole('button', { name: 'Login' }).click();

      await page.getByTestId('username').fill('test');
      await page.getByTestId('password').fill('secre');

      await page.getByTestId('login').click();

      await expect(page.getByText('invalid username or password')).toBeVisible();
      await expect(page.getByText('invalid username or password')).toHaveCSS('border-color', 'rgb(255, 0, 0)');
    })
  })
});
