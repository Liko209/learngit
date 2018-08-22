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
describe('Trace', () => {
  test(
    '',
    async () => {
      await page.goto(URL);
      await page.click('input[name=username]');
      await page.type('input[name=username]', '18778062222');
      await page.click('input[name=password]');
      await page.type('input[name=password]', 'Test!123');
      await page.click('button');
      await page.tracing.start({
        path: './trace.json'
      });
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.tracing.stop();
    },
    9000000
  );
});
afterAll(() => {
  browser.close();
});
