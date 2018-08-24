async function login(page, APP_URL, MAX_MEMORY) {
  await page.goto(APP_URL);
  await page.select('select', 'Chris_sandbox');
  await page.goto(APP_URL);
  await page.click('input[name=username]');
  await page.type('input[name=username]', '18662032065');
  await page.click('input[name=password]');
  await page.type('input[name=password]', 'Test!123');
  await page.click('button');
  await page.waitForSelector('.Resizer');
}

module.exports = { login };
