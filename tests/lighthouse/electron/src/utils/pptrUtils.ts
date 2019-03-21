/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 09:39:26
 */
import * as puppeteer from "puppeteer-core";
import { Page } from "puppeteer-core/lib/Page";
import { Browser } from "puppeteer-core/lib/Browser";
import { LogUtils } from "./logUtils";
import { MockClient, BrowserInitDto } from 'mock-client';
import { Config } from '../config';
import { MaxSelectorRetryCount, MaxSelectorTimeout } from '../constants';
import * as bluebird from 'bluebird';

const browsers = new Map<string, Browser>();
const logger = LogUtils.getLogger(__filename);

let mockClient: MockClient;
class PptrUtils {

  static async waitForSelector(page: Page, selector: string): Promise<boolean> {
    let retryCount = MaxSelectorRetryCount;
    let element;
    while (retryCount-- > 0) {
      element = await page.$(selector);

      if (element) {
        return true;
      }

      await bluebird.delay(MaxSelectorTimeout);
    }

    return false;
  }

  /**
   * @description: wait for element appear by selector
   */
  static async disappearForSelector(
    page: Page,
    selector: string
  ): Promise<boolean> {
    let retryCount = MaxSelectorRetryCount;
    let element;
    while (retryCount-- > 0) {
      element = await page.$(selector);

      if (!element) {
        return true;
      }

      await bluebird.delay(MaxSelectorTimeout);
    }

    return false;
  }

  static async scrollBy(page: Page, selector: string, x: number, y: number): Promise<boolean> {
    if (!(await PptrUtils.waitForSelector(page, selector))) {
      return false;
    }

    await page.$eval(selector, (node, x, y) => {
      node.scrollBy(x, y);
    }, x, y);

    return true;
  }
  /**
   * @description: wait for element appear and click
   */
  static async click(page: Page, selector: string, options = {}): Promise<boolean> {
    if (!(await PptrUtils.waitForSelector(page, selector))) {
      return false;
    }

    let opt = Object.assign(
      { button: "left", clickCount: 1, delay: 0 },
      options
    );
    let element = await page.$(selector);
    await element.click();
    return true;
  }

  static async setText(
    page: Page,
    selector: string,
    text: string,
    check: boolean = true,
    options = {}
  ): Promise<boolean> {
    if (!(await PptrUtils.waitForSelector(page, selector))) {
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

    let cnt = MaxSelectorRetryCount,
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

  static async launch(options = {}): Promise<Browser> {
    let defaultArgs = [
      "--ignore-certificate-errors",
      "--enable-devtools-experiments",
      `--remote-debugging-port=${Config.electronDebugPort}`
    ];
    if (options["args"]) {
      defaultArgs = defaultArgs.concat(options["args"]);
    }

    options["args"] = Array.from(new Set(defaultArgs));
    let opt = Object.assign(
      {
        headless: false,
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        executablePath: Config.electronPath
      },
      options
    );

    let browser = await puppeteer.launch(opt);

    logger.info(`electron process id: ${browser.process().pid}`)

    await this.injectMockServer(browser);

    const wsEndpoint = PptrUtils.toEndpoint(browser.wsEndpoint());

    logger.info(
      `launch electron success, wsEndpoint: ${wsEndpoint}, options: ${JSON.stringify(
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
        logger.info(`get electron connection from cache, wsEndpoint: ${wsEndpoint}`);
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

      logger.info(`connect electron success, wsEndpoint: ${wsEndpoint}`);

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
        logger.info(`close electron connection, wsEndpoint: ${wsEndpoint}`);
        if (browser) {
          await browser.close();
        }
      } catch (err) {
        logger.error(err);
      }
    });

    logger.info("electron connection closed.");
  }

  private static toEndpoint(wsEndpoint: string) {
    return wsEndpoint.replace('localhost', '127.0.0.1');
  }

  static async cleanMock() {
    mockClient = undefined;
  }

  private static async injectMockServer(browser: Browser) {
    if (!Config.mockSwitch) {
      return;
    }

    if (browser.mockClient) {
      return;
    }

    let requestId;
    if (!mockClient) {
      mockClient = new MockClient(Config.mockServerUrl);

      let initDto = BrowserInitDto.of()
        .env(Config.jupiterEnv)
        .appKey(Config.jupiterAppKey)
        .appSecret(Config.jupiterAppSecret)
        .useInitialCache(Config.useInitialCache);

      requestId = await mockClient.registerBrowser(initDto);

      logger.info(`mock requestId : ${requestId}`);

      mockClient['requestId'] = requestId;
    } else {
      requestId = mockClient['requestId'];
    }

    browser.mockClient = mockClient;

    let pages = await browser.pages();
    for (let page of pages) {
      await page.setExtraHTTPHeaders({ "x-mock-request-id": requestId });
    }
  }
}

export {
  PptrUtils
}
