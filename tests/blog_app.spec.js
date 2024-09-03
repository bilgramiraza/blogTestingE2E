const { test, describe, beforeEach, expect } = require("@playwright/test");
const { loginWith, createBlog } = require("./helper");

describe('Blog App', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset');
    await request.post('/api/users', {
      data: {
        username: 'test',
        name: 'tester',
        password: 'secret',
      }
    });
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
    test('Succeeds with valid Credentials', async ({ page }) => {
      const notificationDiv = page.getByTestId('notification');

      await loginWith(page, 'test', 'secret');

      await expect(notificationDiv.getByText('tester has Logged In')).toBeVisible();
      await expect(notificationDiv.getByText('tester has Logged In')).toHaveCSS('border-color', 'rgb(0, 128, 0)');
    })
    test('Fails with invalid Credentials', async ({ page }) => {
      const notificationDiv = page.getByTestId('notification');

      await loginWith(page, 'test', 'secre');

      await expect(notificationDiv.getByText('invalid username or password')).toBeVisible();
      await expect(notificationDiv.getByText('invalid username or password')).toHaveCSS('border-color', 'rgb(255, 0, 0)');
    })
  })
  describe('When logged in', async () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'test', 'secret');
    })
    test('A new blog can be created', async ({ page }) => {
      const notificationDiv = page.getByTestId('notification');
      const blogListDiv = page.getByTestId('bloglist');

      await createBlog(page, 'First Blog', 'tester', 'tester.com');

      await expect(notificationDiv.getByText('Blog(First Blog) Created Successfully')).toBeVisible();
      await expect(notificationDiv.getByText('Blog(First Blog) Created Successfully')).toHaveCSS('border-color', 'rgb(0, 128, 0)');

      await expect(blogListDiv.getByText('First Blog')).toBeVisible();
      await expect(blogListDiv).toHaveCount(1);
    })
  })
});
