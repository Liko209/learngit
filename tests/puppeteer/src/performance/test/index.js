const fs = require("fs");
const { promisify } = require("util");

const puppeteer = require("puppeteer");
const { testPage, setup } = require("./testPage");
const ProgressBar = require("progress");

const convertResultsToArr = (res, stage) => {
  const arr = [];

  for (let [variable, value] of Object.entries(res)) {
    arr.push({
      variable,
      value,
      stage
    });
  }
  return arr;
};

const test = async (runs, emulateConditions, filePath) => {
  const bar = new ProgressBar(":bar :percent :current/:total remain :eta s", {
    total: runs * 4
  });
  let browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreHTTPSErrors: true
  });
  let page = await browser.newPage();
  let client = await page.target().createCDPSession();
  await emulateConditions(client);

  await setup(page);
  page.close();
  await promisify(fs.writeFile)(filePath, JSON.stringify([]));
  for (let i = 0; i < runs; i++) {
    let res = [];

    page = await browser.newPage();
    client = await page.target().createCDPSession();
    await emulateConditions(client);
    res = [
      ...res,
      ...convertResultsToArr(await testPage(page, client), "1. sw&cache")
    ];
    bar.tick();
    await page.close();

    page = await browser.newPage();
    client = await page.target().createCDPSession();
    await emulateConditions(client);
    await client.send("Network.clearBrowserCache");
    res = [
      ...res,
      ...convertResultsToArr(await testPage(page, client), "2. sw")
    ];
    bar.tick();
    await page.close();

    page = await browser.newPage();
    client = await page.target().createCDPSession();
    await emulateConditions(client);
    await client.send("ServiceWorker.enable");
    await client.send("ServiceWorker.unregister", {
      scopeURL: "https://develop.fiji.gliprc.com"
    });
    res = [
      ...res,
      ...convertResultsToArr(await testPage(page, client), "3. cache")
    ];
    bar.tick();
    await page.close();

    page = await browser.newPage();
    client = await page.target().createCDPSession();
    await emulateConditions(client);
    await client.send("ServiceWorker.enable");
    await client.send("ServiceWorker.unregister", {
      scopeURL: "https://develop.fiji.gliprc.com"
    });
    await client.send("Network.clearBrowserCache");
    res = [
      ...res,
      ...convertResultsToArr(await testPage(page, client), "4. no cache and sw")
    ];
    bar.tick();
    await page.close();

    const file = JSON.parse(await promisify(fs.readFile)(filePath));
    await promisify(fs.writeFile)(filePath, JSON.stringify([...file, ...res]));
  }
};

module.exports = test;
