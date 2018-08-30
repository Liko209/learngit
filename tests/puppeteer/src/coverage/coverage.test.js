import puppeteer from 'puppeteer';
import pti from 'puppeteer-to-istanbul';

// const appUrlBase = 'http://localhost:3000';
const appUrlBase = 'https://fiji.lab.rcch.ringcentral.com';
const routes = {
  public: {
    login: `${appUrlBase}/login`,
    conversation: `${appUrlBase}/conversation/5636102`
  },
  private: {
    home: `${appUrlBase}`
  }
};

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

describe('Coverage', () => {
  test(
    'coverage',
    async () => {
      // Enable both JavaScript and CSS coverage

      // Navigate to page
      await page.goto(routes.public.login);
      // await analyzePerformance(page);
      await page.select('select', 'Chris_sandbox');
      await page.goto(routes.public.login);
      await page.click('input[name=username]');
      await page.type('input[name=username]', '18662032065');
      await page.click('input[name=password]');
      await page.type('input[name=password]', 'Test!123');
      await page.click('button');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      // Disable both JavaScript and CSS coverage
      await page.close();
      page = await browser.newPage();
      await Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage()
      ]);
      await page.goto(routes.public.conversation, {
        waitUntil: 'networkidle0'
      });
      const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage()
      ]);

      pti.write(jsCoverage);
      pti.write(cssCoverage);
    },
    9000000
  );
});
// This function occurs after the result of each tests, it closes the browser
afterAll(() => {
  browser.close();
});
