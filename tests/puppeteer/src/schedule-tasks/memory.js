const puppeteer = require('puppeteer');
const { login } = require('./setup');
const { getMB } = require('./utils');
// jest.setTimeout(1000000);

let TEST_TIMES = 10;

const APP_URL = process.env.appUrl;
const MAX_MEMORY = process.env.maxMemory;

const firstUsedMemoryAvg = [];
const firstTotalMemoryAvg = [];

const reloadUsedMemoryAvg = [];
const reloadTotalMemoryAvg = [];

const switchTabUsedMemoryAvg = [];
const switchTabTotalMemoryAvg = [];
function getAvg(arr) {
  return getMB(arr.reduce((pre, next) => pre + next, 0) / TEST_TIMES) || 0;
}

async function memoryTests() {
  try {
    const browser = await puppeteer.launch({
      args: ['--enable-precise-memory-info', '--no-sandbox'],
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60 * 1000);
    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');
    await login(page, APP_URL, MAX_MEMORY);
    // let performance = await page.metrics();
    const {
      usedSize: firstUsedSize,
      totalSize: firstTotalSize
    } = await client.send('Runtime.getHeapUsage');

    firstUsedMemoryAvg.push(firstUsedSize);
    firstTotalMemoryAvg.push(firstTotalSize);

    await page.reload({
      waitUntil: 'load'
    });
    await page.waitFor(2 * 1000);
    const {
      usedSize: reloadUsedSize,
      totalSize: reloadTotalSize
    } = await client.send('Runtime.getHeapUsage');

    reloadUsedMemoryAvg.push(reloadUsedSize);
    reloadTotalMemoryAvg.push(reloadTotalSize);

    const otherPage = await browser.newPage();
    await otherPage.goto('http://www.google.com');
    await otherPage.waitForSelector('#main');

    const {
      usedSize: tabUsedSize,
      totalSize: tabTotalSize
    } = await client.send('Runtime.getHeapUsage');

    switchTabUsedMemoryAvg.push(tabUsedSize);
    switchTabTotalMemoryAvg.push(tabTotalSize);

    await otherPage.close();
    // console.log(otherPage, '------otherPage');
    // console.log(await browser.pages());

    console.log(TEST_TIMES, '-----TEST success');
    await browser.close();
  } catch (e) {
    console.error(`Test fail: ${e}`);
    --TEST_TIMES;
    console.log(TEST_TIMES, '-----TEST');
    await e;
  }
}
process.on('uncaughtException', function(err) {
  console.log(err);
});

function run() {
  const testPromiseArr = [];
  for (let i = 0; i < TEST_TIMES; i++) {
    testPromiseArr.push(memoryTests());
  }
  Promise.all(testPromiseArr)
    .catch(e => {
      console.log(e, '--------eeeeeee');
    })
    .finally(() => {
      console.log(
        `--------------- Finally success times: ${TEST_TIMES} --------------`
      );
      console.log(
        `firstUsed: ${getAvg(firstUsedMemoryAvg)}MB firstTotalUsed: ${getAvg(
          firstTotalMemoryAvg
        )}MB`
      );
      console.log(
        `reloadUsed: ${getAvg(reloadUsedMemoryAvg)}MB reloadTotalUsed: ${getAvg(
          reloadTotalMemoryAvg
        )}MB`
      );
      console.log(
        `switchTabUsed: ${getAvg(
          switchTabUsedMemoryAvg
        )}MB switchTabTotalUsed: ${getAvg(switchTabTotalMemoryAvg)}MB`
      );
      if (TEST_TIMES < 5) {
        process.exit(1);
      } else {
        process.exit('success');
      }
    });
}

run();
