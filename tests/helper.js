const loginWith = async (page, username, password) => {
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(password);

  await page.getByTestId('login').click();
};

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'Create New Blog' }).click();

  await page.getByTestId('title').fill(title);
  await page.getByTestId('author').fill(author);
  await page.getByTestId('url').fill(url);

  await page.getByTestId('create').click();
  await page.getByTestId('notification').getByText(`Blog(${title}) Created Successfully`).waitFor();
};

export {
  loginWith,
  createBlog,
};
