const { test, describe, beforeEach, expect } = require("@playwright/test");
const { loginWith, createBlog } = require("./helper");
const exp = require("constants");

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
  describe('Blog Interactions', async () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'test', 'secret');
      await createBlog(page, 'First Blog', 'tester', 'tester.com');

      await page.getByRole('button', { name: 'show' }).click();
    })
    test('A blog can be liked', async ({ page }) => {
      const notificationDiv = page.getByTestId('notification');
      const blogUrl = page.getByTestId('blogUrl');
      const blogUser = page.getByTestId('blogUser');
      const likeButton = page.getByTestId('blogLike');
      const deleteButton = page.getByTestId('blogDelete');

      await expect(blogUrl).toBeVisible();
      await expect(blogUrl).toHaveText('tester.com');

      await expect(likeButton).toBeVisible();
      await expect(likeButton).toHaveText('0');

      await expect(blogUser).toBeVisible();
      await expect(blogUser).toHaveText('test');

      await expect(deleteButton).toBeVisible();

      await likeButton.click();

      await expect(likeButton).toHaveText('1');
      await expect(notificationDiv.getByText('Blog(First Blog) Liked Successfully')).toBeVisible();
      await expect(notificationDiv.getByText('Blog(First Blog) Liked Successfully')).toHaveCSS('border-color', 'rgb(0, 128, 0)');
    })
    test('A blog can be deleted', async ({ page }) => {
      const notificationDiv = page.getByTestId('notification');
      const blogListDiv = page.getByTestId('bloglist');
      const deleteButton = page.getByTestId('blogDelete');

      page.on('dialog', dialog => dialog.accept());
      await deleteButton.click();

      await expect(notificationDiv.getByText('Blog(First Blog By tester) Deleted Successfully')).toBeVisible();
      await expect(notificationDiv.getByText('Blog(First Blog By tester) Deleted Successfully')).toHaveCSS('border-color', 'rgb(0, 128, 0)');

      await expect(blogListDiv).not.toBeVisible();
    })
  })
});
