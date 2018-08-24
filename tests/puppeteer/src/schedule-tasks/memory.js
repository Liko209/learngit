const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const moment = require('moment');
const { login } = require('./setup');
const { getMB } = require('./utils');
// jest.setTimeout(1000000);

const NOW_TIME = moment().format('YYYY-MM-DD HH:mm:ss');
const FILE_NAME = `memory_${NOW_TIME}`;

let TEST_TIMES = process.env.times || 10;

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

function report(content) {
  fs.ensureDir(`${__dirname}/report`);
  fs.writeFileSync(`${__dirname}/report/${FILE_NAME}`, content);
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

    // console.log(TEST_TIMES, '-----TEST success');
    await browser.close();
  } catch (e) {
    console.error(`Test fail: ${e}`);
    --TEST_TIMES;
    // console.log(TEST_TIMES, '-----TEST');
    await e;
  }
}

function run() {
  const testPromiseArr = [];
  for (let i = 0; i < TEST_TIMES; i++) {
    testPromiseArr.push(memoryTests());
  }
  Promise.all(testPromiseArr).finally(() => {
    console.log(
      `--------------- Finally success times: ${TEST_TIMES} --------------`
    );

    const firstUsedMemory = `${getAvg(firstUsedMemoryAvg)}MB`;
    const firstTotalUsedMemory = `${getAvg(firstTotalMemoryAvg)}MB`;

    const reloadUsed = `${getAvg(reloadUsedMemoryAvg)}MB`;
    const reloadTotal = `${getAvg(reloadTotalMemoryAvg)}MB`;

    const switchTabUsed = `${getAvg(switchTabUsedMemoryAvg)}MB`;
    const switchTabTotal = `${getAvg(switchTabTotalMemoryAvg)}MB`;

    console.log(
      `firstUsed: ${firstUsedMemory} firstTotalUsed: ${firstTotalUsedMemory}`
    );
    console.log(`reloadUsed: ${reloadUsed} reloadTotalUsed: ${reloadTotal}`);
    console.log(
      `switchTabUsed: ${switchTabUsed} switchTabTotalUsed: ${switchTabTotal}`
    );
    if (TEST_TIMES < TEST_TIMES / 2) {
      process.exit(1);
    } else {
      if (
        firstTotalUsedMemory > MAX_MEMORY ||
        reloadTotal > MAX_MEMORY ||
        switchTabTotal > MAX_MEMORY
      ) {
        report(
          `Memory Error  firstUsed: ${firstUsedMemory} firstTotalUsed: ${firstTotalUsedMemory}\nreloadUsed: ${reloadUsed} reloadTotalUsed: ${reloadTotal}\nswitchTabUsed: ${switchTabUsed} switchTabTotalUsed: ${switchTabTotal}`
        );
        console.log('');
        console.log('Emergency Memory Error!');
        console.log('');
        process.exit(1);
      }
      process.exit(0);
    }
  });
}

run();
