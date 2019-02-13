/*
 * @Author: doyle.wu
 * @Date: 2018-12-08 18:07:46
 */
import * as puppeteer from "puppeteer";
import { Page } from "puppeteer/lib/Page";
import { Browser } from "puppeteer/lib/Browser";
import { logUtils } from "./LogUtils";
import { functionUtils } from "./FunctionUtils";
import { MockClient, BrowserInitDto } from 'mock-client';

const MAX_TRY_COUNT = 10;

const mockServerUrl = process.env.MOCK_SERVER_URL || "https://xmn02-i01-mck01.lab.nordigy.ru";

class PuppeteerUtils {
  private _browsers = new Map<string, Browser>();
  private logger = logUtils.getLogger(__filename);

  /**
   * @description: wait for element appear by selector
   */
  async disappearForSelector(
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
  async waitForSelector(
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

  async exist(page: Page, selector: string, options = {}) {
    return await this.waitForSelector(page, selector, options);
  }

  /**
   * @description: wait for element appear by xpath
   */
  async waitForXpath(
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
  async type(
    page: Page,
    selector: string,
    text: string,
    check: boolean = true,
    options = {}
  ): Promise<boolean> {
    let typeOpt = Object.assign({ delay: 50 }, options);

    if (!(await this.waitForSelector(page, selector, options))) {
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

  async setText(
    page: Page,
    selector: string,
    text: string,
    check: boolean = true,
    options = {}
  ): Promise<boolean> {
    if (!(await this.waitForSelector(page, selector, options))) {
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
  async click(page: Page, selector: string, options = {}): Promise<boolean> {
    if (!(await this.waitForSelector(page, selector, options))) {
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
  async text(page: Page, selector: string, options = {}): Promise<boolean> {
    if (!(await this.waitForSelector(page, selector, options))) {
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

  async launch(options = {}): Promise<Browser> {
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

    await this.injectMockServer(browser);

    const wsEndpoint = this.toEndpoint(browser.wsEndpoint());

    this.logger.info(
      `launch chrome success, wsEndpoint: ${wsEndpoint}, options: ${JSON.stringify(
        opt
      )}`
    );

    this._browsers.set(wsEndpoint, browser);

    return browser;
  }

  async connect(wsEndpoint: string): Promise<Browser> {
    try {
      wsEndpoint = this.toEndpoint(wsEndpoint);
      let browser = this._browsers.get(wsEndpoint);
      if (browser) {
        this.logger.info(`get chrome connection from cache, wsEndpoint: ${wsEndpoint}`);
        return browser;
      }

      browser = await puppeteer.connect({
        headless: false,
        defaultViewport: null,
        browserWSEndpoint: wsEndpoint,
        ignoreHTTPSErrors: true
      });

      await this.injectMockServer(browser);

      wsEndpoint = this.toEndpoint(wsEndpoint);

      this.logger.info(`connect chrome success, wsEndpoint: ${wsEndpoint}`);

      this._browsers.set(wsEndpoint, browser);

      return browser;
    } catch (err) { }
    return null;
  }

  async close(browser: Browser) {
    if (browser) {
      const wsEndpoint = browser.wsEndpoint();

      this._browsers.delete(this.toEndpoint(wsEndpoint));

      await browser.close();
    }
  }

  async closeAll(): Promise<Browser> {

    this._browsers.forEach(async (browser, wsEndpoint) => {
      try {
        this.logger.info(`close chrome connection, wsEndpoint: ${wsEndpoint}`);
        if (browser) {
          await browser.close();
        }
      } catch (err) {
        this.logger.error(err);
      }
    });

    this.logger.info("chrome connection closed.");
  }

  private toEndpoint(wsEndpoint: string) {
    return wsEndpoint.replace('localhost', '127.0.0.1');
  }

  private async injectMockServer(browser: Browser) {
    if (process.env.MOCK_SWITCH !== 'true') {
      return;
    }

    if (browser.mockClient) {
      return;
    }

    const client = new MockClient(mockServerUrl);

    let initDto = BrowserInitDto.of()
      .env(process.env.JUPITER_ENV)
      .appKey(process.env.JUPITER_APP_KEY)
      .appSecret(process.env.JUPITER_APP_SECRET);

    let requestId = await client.registerBrowser(initDto);

    this.logger.info(`mock requestId : ${requestId}`);

    client['requestId'] = requestId;

    browser.mockClient = client;

    functionUtils.bindEvent(browser, 'targetcreated', async target => {
      let page = await target.page();
      if (page) {
        await page.setExtraHTTPHeaders({ "x-mock-request-id": requestId });
      }
    })
  }
}

const puppeteerUtils = new PuppeteerUtils();
export { puppeteerUtils, PuppeteerUtils };
