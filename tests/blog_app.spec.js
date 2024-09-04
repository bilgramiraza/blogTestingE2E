const { test, describe, beforeEach, expect } = require("@playwright/test");
const { loginWith, createBlog, logout } = require("./helper");
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
    await request.post('/api/users', {
      data: {
        username: 'test2',
        name: 'testino',
        password: 'secre',
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
    beforeEach(async ({ page }, testInfo) => {
      testInfo.setTimeout(20000);

      await loginWith(page, 'test', 'secret');
      await page.getByTestId('notification').getByText('tester has Logged In').waitFor();
      await createBlog(page, 'First Blog', 'tester', 'tester.com');
      logout(page);

      await loginWith(page, 'test2', 'secre');
      await page.getByTestId('notification').getByText('testino has Logged In').waitFor();
      await createBlog(page, 'Second Blog', 'testino', 'testing.com');
      logout(page);

      await loginWith(page, 'test', 'secret');
    })
    test('A blog can be liked', async ({ page }) => {
      const notificationDiv = page.getByTestId('notification');
      const firstBlog = page.getByTestId('bloglist').locator('div').filter({ hasText: 'First Blog' });
      const blogUrl = firstBlog.getByTestId('blogUrl');
      const blogUser = firstBlog.getByTestId('blogUser');
      const likeButton = firstBlog.getByTestId('blogLike');
      const deleteButton = firstBlog.getByTestId('blogDelete');

      await firstBlog.getByRole('button', { name: 'show' }).click();

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
      const firstBlog = page.getByTestId('bloglist').locator('div').filter({ hasText: 'First Blog' });
      const deleteButton = firstBlog.getByTestId('blogDelete');

      await firstBlog.getByRole('button', { name: 'show' }).click();

      page.on('dialog', dialog => dialog.accept());
      await deleteButton.click();

      await expect(notificationDiv.getByText('Blog(First Blog By tester) Deleted Successfully')).toBeVisible();
      await expect(notificationDiv.getByText('Blog(First Blog By tester) Deleted Successfully')).toHaveCSS('border-color', 'rgb(0, 128, 0)');

      await expect(firstBlog).toHaveCount(0);
    })
    test('The blog delete Button is only Visible to its author', async ({ page }) => {
      const firstBlog = page.getByTestId('bloglist').locator('div').filter({ hasText: 'First Blog' });
      const secondBlog = page.getByTestId('bloglist').locator('div').filter({ hasText: 'Second Blog' });

      await secondBlog.getByRole('button', { name: 'show' }).click();

      await expect(secondBlog.getByTestId('blogDelete')).not.toBeVisible();

      await firstBlog.getByRole('button', { name: 'show' }).click();

      await expect(firstBlog.getByTestId('blogDelete')).toBeVisible();
    })
    test('The blogs sort as per their likes', async ({ page }) => {
      const firstBlog = page.getByTestId('bloglist').locator('div').filter({ hasText: 'First Blog' });
      const secondBlog = page.getByTestId('bloglist').locator('div').filter({ hasText: 'Second Blog' });

      await firstBlog.getByRole('button', { name: 'show' }).click();
      await firstBlog.getByTestId('blogLike').click();
      await firstBlog.getByText('1').waitFor();
      await firstBlog.getByRole('button', { name: 'hide' }).click();

      await secondBlog.getByRole('button', { name: 'show' }).click();
      await secondBlog.getByTestId('blogLike').click();
      await secondBlog.getByText('1').waitFor();
      await secondBlog.getByTestId('blogLike').click();
      await secondBlog.getByText('2').waitFor();
      await secondBlog.getByRole('button', { name: 'hide' }).click();

      await expect(page.getByTestId('bloglist').first()).toContainText('Second Blog');
      await expect(page.getByTestId('bloglist').last()).toContainText('First Blog');
    })
  })
});
