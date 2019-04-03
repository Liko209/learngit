/*
 * @Author: doyle.wu
 * @Date: 2018-12-08 18:07:46
 */
import * as puppeteer from "puppeteer";
import { Page } from "puppeteer/lib/Page";
import { Browser } from "puppeteer/lib/Browser";
import { LogUtils } from "./logUtils";
import { FunctionUtils } from "./functionUtils";
import { MockClient, BrowserInitDto } from 'mock-client';
import { Config } from '../config';

const MAX_TRY_COUNT = 10;

const browsers = new Map<string, Browser>();

const logger = LogUtils.getLogger(__filename);

class PptrUtils {
  static async scrollBy(page: Page, selector: string, x: number, y: number, options = {}): Promise<boolean> {
    if (!(await PptrUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    await page.$eval(selector, (node, x, y) => {
      node.scrollBy(x, y);
    }, x, y);

    return true;
  }

  /**
   * @description: wait for element appear by selector
   */
  static async disappearForSelector(
    page: Page,
    selector: string,
    options = {}
  ): Promise<boolean> {
    let opt = Object.assign({ visible: true, timeout: 30000 }, options);

    let cnt = MAX_TRY_COUNT;
    opt["timeout"] = opt["timeout"] / cnt;

    while (cnt-- > 0) {
      try {
        await page.waitForSelector(selector, opt);
      } catch (error) {
        return true;
      }
    }
    return false;
  }

  /**
   * @description: wait for element appear by selector
   */
  static async waitForSelector(
    page: Page,
    selector: string,
    options = {}
  ): Promise<boolean> {
    let opt = Object.assign({ visible: true, timeout: 30000 }, options);

    let cnt = MAX_TRY_COUNT;
    opt["timeout"] = opt["timeout"] / cnt;

    while (cnt-- > 0) {
      try {
        await page.waitForSelector(selector, opt);
        return true;
      } catch (error) { }
    }
    return false;
  }

  static async exist(page: Page, selector: string, options = {}) {
    return await PptrUtils.waitForSelector(page, selector, options);
  }

  /**
   * @description: wait for element appear by xpath
   */
  static async waitForXpath(
    page: Page,
    xpath: string,
    options = {}
  ): Promise<boolean> {
    let opt = Object.assign({ visible: true, timeout: 30000 }, options);

    let cnt = MAX_TRY_COUNT;
    opt["timeout"] = opt["timeout"] / cnt;

    while (cnt-- > 0) {
      try {
        await page.waitForXPath(xpath, opt);
        return true;
      } catch (error) { }
    }
    return false;
  }

  /**
   * @description: ensure type text into element
   */
  static async type(
    page: Page,
    selector: string,
    text: string,
    check: boolean = true,
    options = {}
  ): Promise<boolean> {
    let typeOpt = Object.assign({ delay: 50 }, options);

    if (!(await PptrUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    await page.type(selector, text, typeOpt);

    if (!check) {
      return true;
    }

    let cnt = MAX_TRY_COUNT,
      res;
    while (cnt-- > 0) {
      try {
        res = await page.$eval(
          selector,
          (node, args) => {
            let result = node.value === args[0];
            if (!result) {
              // clear text
              node.value = "";
            }
            return result;
          },
          [text]
        );
        if (res) {
          return true;
        }

        await page.type(selector, text, typeOpt);
      } catch (error) { }
    }

    return false;
  }

  static async setText(
    page: Page,
    selector: string,
    text: string,
    check: boolean = true,
    options = {}
  ): Promise<boolean> {
    if (!(await PptrUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    await page.$eval(selector, (node, args) => {
      // clear text
      node.value = "";
    });

    await page.type(selector, text, options);
    if (!check) {
      return true;
    }

    let cnt = MAX_TRY_COUNT,
      res;
    while (cnt-- > 0) {
      try {
        res = await page.$eval(
          selector,
          (node, args) => {
            let result = node.value === args[0];
            if (!result) {
              // clear text
              node.value = "";
            }
            return result;
          },
          [text]
        );
        if (res) {
          return true;
        }
        await page.type(selector, text, options);
      } catch (error) { }
    }

    return false;
  }

  /**
   * @description: wait for element appear and click
   */
  static async click(page: Page, selector: string, options = {}): Promise<boolean> {
    if (!(await PptrUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    let opt = Object.assign(
      { button: "left", clickCount: 1, delay: 0 },
      options
    );

    await page.click(selector, opt);

    return true;
  }

  /**
   * @description: get element text
   */
  static async text(page: Page, selector: string, options = {}): Promise<boolean> {
    if (!(await PptrUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    let text = await page.$eval(selector, node => {
      let text = node.value;
      if (text) {
        return text;
      }
      return node.innerHTML;
    });

    return text;
  }

  static async launch(options = {}): Promise<Browser> {
    let defaultArgs = ["--ignore-certificate-errors"];
    if (options["args"]) {
      defaultArgs = defaultArgs.concat(options["args"]);
    }

    options["args"] = Array.from(new Set(defaultArgs));
    let opt = Object.assign(
      {
        headless: false,
        defaultViewport: null,
        ignoreHTTPSErrors: true
      },
      options
    );

    let browser = await puppeteer.launch(opt);

    await PptrUtils.injectMockServer(browser);

    const wsEndpoint = PptrUtils.toEndpoint(browser.wsEndpoint());

    logger.info(
      `launch chrome success, wsEndpoint: ${wsEndpoint}, options: ${JSON.stringify(
        opt
      )}`
    );

    browsers.set(wsEndpoint, browser);

    return browser;
  }

  static async connect(wsEndpoint: string): Promise<Browser> {
    try {
      wsEndpoint = PptrUtils.toEndpoint(wsEndpoint);
      let browser = browsers.get(wsEndpoint);
      if (browser) {
        logger.info(`get chrome connection from cache, wsEndpoint: ${wsEndpoint}`);
        return browser;
      }

      browser = await puppeteer.connect({
        headless: false,
        defaultViewport: null,
        browserWSEndpoint: wsEndpoint,
        ignoreHTTPSErrors: true
      });

      await PptrUtils.injectMockServer(browser);

      wsEndpoint = PptrUtils.toEndpoint(wsEndpoint);

      logger.info(`connect chrome success, wsEndpoint: ${wsEndpoint}`);

      browsers.set(wsEndpoint, browser);

      return browser;
    } catch (err) { }
    return null;
  }

  static async close(browser: Browser) {
    if (browser) {
      const wsEndpoint = browser.wsEndpoint();

      browsers.delete(PptrUtils.toEndpoint(wsEndpoint));

      await browser.close();
    }
  }

  static async closeAll(): Promise<Browser> {

    browsers.forEach(async (browser, wsEndpoint) => {
      try {
        logger.info(`close chrome connection, wsEndpoint: ${wsEndpoint}`);
        if (browser) {
          await browser.close();
        }
      } catch (err) {
        logger.error(err);
      }
    });

    logger.info("chrome connection closed.");
  }

  private static toEndpoint(wsEndpoint: string) {
    return wsEndpoint.replace('localhost', '127.0.0.1');
  }

  private static async injectMockServer(browser: Browser) {
    if (!Config.mockSwitch) {
      return;
    }

    if (browser.mockClient) {
      return;
    }

    const client = new MockClient(Config.mockServerUrl);

    let initDto = BrowserInitDto.of()
      .env(Config.jupiterEnv)
      .appKey(Config.jupiterAppKey)
      .appSecret(Config.jupiterAppSecret)
      .useInitialCache(Config.useInitialCache);

    let requestId = await client.registerBrowser(initDto);

    logger.info(`mock requestId : ${requestId}`);

    client['requestId'] = requestId;

    browser.mockClient = client;

    FunctionUtils.bindEvent(browser, 'targetcreated', async target => {
      let page = await target.page();
      if (page) {
        await page.setExtraHTTPHeaders({ "x-mock-request-id": requestId });
      }
    })
  }
}

export { PptrUtils };
