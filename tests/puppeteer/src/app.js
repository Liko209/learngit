import puppeteer from 'puppeteer'
import pti from 'puppeteer-to-istanbul'
import { analyzePerformance, Metrics } from 'jest-puppeteer-performance'
import chalk from 'chalk'

// const appUrlBase = 'http://localhost:3000';
const appUrlBase = 'https://fiji.lab.rcch.ringcentral.com'
const routes = {
  public: {
    login: `${appUrlBase}/login`,
    conversation: `${appUrlBase}/conversation/5636102`
  },
  private: {
    home: `${appUrlBase}`
  }
}

let browser
let page

beforeAll(async () => {
  // launch browser
  browser = await puppeteer.launch({
    headless: false // headless mode set to false so browser opens up with visual feedback
    // slowMo: 250 // how slow actions should be
  })
  // creates a new page in the opened browser
  page = await browser.newPage()
})

describe('Login', () => {
  test(
    'users can login',
    async () => {
      await page.goto(routes.public.conversation)
      // await analyzePerformance(page);
      await page.click('input[name=username]')
      await page.type('input[name=username]', '18778062222')
      await page.click('input[name=password]')
      await page.type('input[name=password]', 'Test!123')
      await page.click('button')
      await page.waitForNavigation({ waitUntil: 'networkidle0' })
      // const [jsCoverage] = await Promise.all([
      //   page.coverage.stopJSCoverage(),
      //   page.coverage.stopCSSCoverage()
      // ]);
      // await analyzePerformance(page, {
      //   exclude: [Metrics.KEYS.Timestamp],
      //   minSamples: 5,
      //   maxSamples: 20,
      //   thresholds: {
      //     '*': {
      //       limit: 2,
      //       type: Metrics.THRESHOLD.Percentage
      //     }
      //   }
      // });
      // pti.write(jsCoverage);
      // pti.write(cssCoverage);
      console.log(chalk.cyan('Page: 1st load'))
      // Wait for sw ready promise to resolve before moving on. This signals the sw
      // has installed and cached assets in the `install` event.
      await page.evaluate('navigator.serviceWorker.ready')
      // Alternatively, wait for UI toast to popup signalling sw caching is done.
      // That's specific to this page's implementation though.
      // await page.waitForSelector('chromedash-toast[open]');

      // Capture requests during 2nd load.
      const allRequests = new Map()
      page.on('request', req => {
        allRequests.set(req.url(), req)
      })

      // Could also go offline and verify requests don't 404.
      // await page.setOfflineMode(true);

      // Reload page to pick up any runtime caching done by the service worker.
      console.log(chalk.cyan('Page: 2nd load'))
      await page.reload({ waitUntil: 'networkidle0' })

      // Assert the page has a SW.
      console.assert(
        await page.evaluate('navigator.serviceWorker.controller'),
        'page has active service worker'
      )

      console.log(
        chalk.cyan(`Requests made by ${appUrlBase}`),
        `(${chalk.green('✔ cached by sw')}, ${chalk.red('✕ not cached')})`
      )
      Array.from(allRequests.values()).forEach(req => {
        const NUM_CHARS = 300
        const url = req.url().length > NUM_CHARS
          ? req.url().slice(0, NUM_CHARS) + '...'
          : req.url()
        console.log(
          url,
          req.response().fromServiceWorker() ? chalk.green('✔') : chalk.red('✕')
        )
      })

      // await analyzePerformance(page);
      // await page.reload({ waitUntil: 'networkidle0' });
      // await analyzePerformance(page);
      // await page.reload({ waitUntil: 'networkidle0' });
      // await analyzePerformance(page);
      // await page.reload({ waitUntil: 'networkidle0' });
      // await analyzePerformance(page);
    },
    9000000
  )
})

// describe('Logout', () => {
//   test(
//     'users can logout',
//     async () => {
//       await page.waitForSelector('button');

//       await page.click('button');
//       await page.waitForSelector('Form');
//     },
//     9000000
//   );
// });
// describe('Coverage', () => {
//   test(
//     'coverage',
//     async () => {
//       // Enable both JavaScript and CSS coverage
//       await Promise.all([
//         page.coverage.startJSCoverage(),
//         page.coverage.startCSSCoverage()
//       ]);
//       // Navigate to page
//       await page.goto(appUrlBase);
//       // Disable both JavaScript and CSS coverage
//       const [jsCoverage, cssCoverage] = await Promise.all([
//         page.coverage.stopJSCoverage(),
//         page.coverage.stopCSSCoverage()
//       ]);

//       pti.write(jsCoverage);
//       pti.write(cssCoverage);
//     },
//     9000000
//   );
// });
// This function occurs after the result of each tests, it closes the browser
afterAll(() => {
  browser.close()
})

// describe('Button Text', () => {
//   test(
//     'h1 loads correctly',
//     async () => {
//       let browser = await puppeteer.launch({
//         headless: false
//       });
//       let page = await browser.newPage();

//       page.emulate({
//         viewport: {
//           width: 500,
//           height: 2400
//         },
//         userAgent: ''
//       });

//       await page.goto('http://localhost:3000/login');
//       await page.waitForSelector('Button');

//       const html = await page.$eval('Button', e => e.innerHTML);
//       expect(html).toBe('Login');

//       browser.close();
//     },
//     16000
//   );
// });
