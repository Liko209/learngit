import chalk from 'chalk';
import puppeteer from 'puppeteer';
import { routes } from './utils/utils';
const URL = routes.public.login;

let browser;
let page;

beforeAll(async () => {
  // launch browser
  browser = await puppeteer.launch({
    headless: false // headless mode set to false so browser opens up with visual feedback
    // slowMo: 250 // how slow actions should be
  });
  // creates a new page in the opened browser
  page = await browser.newPage();
});
describe('Login', () => {
  test(
    '',
    async () => {
      // page.on('console', msg => console.log(chalk.yellow('console'), msg.text()));
      await page.goto(URL);
      await page.select('select', 'Chris_sandbox');
      await page.goto(URL);
      // await analyzePerformance(page);
      await page.click('input[name=username]');
      await page.type('input[name=username]', '18662032065');
      await page.click('input[name=password]');
      await page.type('input[name=password]', 'Test!123');
      await page.click('button');
      await page.waitFor(10 * 1000);

      // await page.waitForNavigation({ waitUntil: 'networkidle0' });
      // Wait for sw ready promise to resolve before moving on. This signals the sw
      // has installed and cached assets in the `install` event.
      console.log(chalk.cyan('Page: 1st load'));

      await page.evaluate('navigator.serviceWorker.ready');
      // Alternatively, wait for UI toast to popup signalling sw caching is done.
      // That's specific to this page's implementation though.
      // await page.waitForSelector('chromedash-toast[open]');

      // Capture requests during 2nd load.
      const allRequests = new Map();
      page.on('request', req => {
        allRequests.set(req.url(), req);
      });

      // Could also go offline and verify requests don't 404.
      // await page.setOfflineMode(true);

      // Reload page to pick up any runtime caching done by the service worker.
      console.log(chalk.cyan('Page: 2nd load'));
      await page.reload({ waitUntil: 'networkidle0' });

      // Assert the page has a SW.
      console.assert(
        await page.evaluate('navigator.serviceWorker.controller'),
        'page has active service worker'
      );

      console.log(
        chalk.cyan(`Requests made by ${URL}`),
        `(${chalk.green('✔ cached by sw')}, ${chalk.red('✕ not cached')})`
      );
      Array.from(allRequests.values()).forEach(req => {
        const NUM_CHARS = 75;
        const url =
          req.url().length > NUM_CHARS
            ? req.url().slice(0, NUM_CHARS) + '...'
            : req.url();
        console.log(
          url,
          req.response().fromServiceWorker() ? chalk.green('✔') : chalk.red('✕')
        );
      });
    },
    9000000
  );
});
afterAll(() => {
  browser.close();
});
