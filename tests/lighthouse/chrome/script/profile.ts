/*
 * @Author: doyle.wu
 * @Date: 2019-08-23 13:13:01
 */
import * as path from "path";
import * as puppeteer from "puppeteer";
import * as bluebird from "bluebird";

const userDataDir = path.join(process.cwd(), 'profiles', 'largeAccount');
// const userDataDir = "";

const loadPost = async (id: string, browser: puppeteer.Browser) => {
  const page = await browser.newPage();

  await page.goto(`https://develop.fiji.gliprc.com/messages/${id}`);

  const panel = 'div[data-test-automation-id="virtualized-list"]';
  const section = 'div[data-test-automation-id="virtualized-list"] section[data-customized-wrapper="true"]';

  await page.waitForSelector(panel);

  while (true) {
    try {
      await page.$eval(panel, (node, x, y) => {
        node.scrollBy(x, y);
      }, 0, -1000);

      await page.waitForSelector(section, { timeout: 500 });
      break;
    } catch (err) {
    }
  }

  await bluebird.delay(5000);

  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    args: [
      "--ignore-certificate-errors",
      "--disable-web-security",
      `--user-data-dir=${userDataDir}`
    ]
  });

  const ids = [
    // "4591173638",
    // "4591181830",
    // "4591190022",
    // "4591198214",
    // "4591206406",
    // "4591214598",
    // "4591222790",
    // "4591230982",
    // "4591239174",
    // "4395524102",
  ];

  for (let id of ids) {
    await loadPost(id, browser);
  }

  await bluebird.delay(1 << 30);
})();

