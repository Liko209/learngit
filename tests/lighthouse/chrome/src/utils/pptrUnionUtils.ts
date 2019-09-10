/*
 * @Author: doyle.wu
 * @Date: 2018-12-08 18:07:46
 */
import "chromedriver";
import * as puppeteer from "puppeteer";
import { Page } from "puppeteer/lib/Page";
import { Browser } from "puppeteer/lib/Browser";
import { LogUtils } from "./logUtils";
import { FunctionUtils } from "./functionUtils";
import { MockClient, BrowserInitDto } from 'mock-client';
import { Config } from '../config';
import { Builder, By, WebDriver } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";
import * as bluebird from "bluebird";

const MAX_TRY_COUNT = 10;

const browsers = new Map<string, Browser>();
const drivers = new Map<string, WebDriver>();

const logger = LogUtils.getLogger(__filename);

class PptrUnionUtils {
  static async trackingHeapObjects(driver): Promise<string> {
    const memory = [];
    if (Config.takeHeapSnapshot) {
      const listener = (data) => {
        if (data.chunk) {
          memory.push(data.chunk);
        }
      }

      driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
      await driver.sendCommand('HeapProfiler.enable');

      driver.on('HeapProfiler.addHeapSnapshotChunk', listener);
      driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
      await driver.sendCommand('HeapProfiler.startTrackingHeapObjects');
      driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
      await driver.sendCommand('HeapProfiler.stopTrackingHeapObjects');

      driver.off('HeapProfiler.addHeapSnapshotChunk', listener);

      driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
      await driver.sendCommand('HeapProfiler.disable');

      logger.info('tracking heap object.');
    }

    return memory.length > 0 ? memory.join('') : '';
  }

  static async collectGarbage(driver) {
    driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
    await driver.sendCommand('HeapProfiler.enable');

    driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
    await driver.sendCommand('HeapProfiler.collectGarbage');

    await bluebird.delay(2000);

    driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
    await driver.sendCommand('HeapProfiler.collectGarbage');

    await bluebird.delay(2000);

    driver.setNextProtocolTimeout(Config.defaultProtocolTimeout);
    await driver.sendCommand('HeapProfiler.disable');

    logger.info('trigger garbage collection.');
  }

  static async scrollBy(page: Page, selector: string, x: number, y: number, options = {}): Promise<boolean> {
    if (!(await PptrUnionUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    const driver = await PptrUnionUtils.getDriver(page);
    await driver.executeScript((selector, x, y) => {
      const element = document.querySelector(selector);
      element.scrollBy(x, y);
    }, selector, x, y);

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
    const driver = await PptrUnionUtils.getDriver(page);

    let opt = Object.assign({ timeout: 10000 }, options);

    let cnt = MAX_TRY_COUNT;
    let time = opt["timeout"] / cnt;
    let elements;

    while (cnt-- > 0) {
      try {
        elements = await driver.findElements(By.css(selector));
        if (elements.length === 0) {
          return true;
        }
        await bluebird.delay(time);
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
    const driver = await PptrUnionUtils.getDriver(page);

    let opt = Object.assign({ timeout: 10000 }, options);

    let cnt = MAX_TRY_COUNT;
    let time = opt["timeout"] / cnt;
    let elements;

    while (cnt-- > 0) {
      try {
        elements = await driver.findElements(By.css(selector));
        if (elements && elements.length > 0) {
          return true;
        }
        await bluebird.delay(time);
      } catch (error) {
      }
    }
    return false;
  }

  static async exist(page: Page, selector: string, options = {}) {
    return await PptrUnionUtils.waitForSelector(page, selector, options);
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
    if (!(await PptrUnionUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    const driver = await PptrUnionUtils.getDriver(page);

    const element = await driver.findElement(By.css(selector));
    await element.sendKeys(text);

    return true;
  }

  static async setText(
    page: Page,
    selector: string,
    text: string,
    check: boolean = true,
    options = {}
  ): Promise<boolean> {
    if (!(await PptrUnionUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    const driver = await PptrUnionUtils.getDriver(page);
    await driver.executeScript((selector) => {
      const element = document.querySelector(selector);
      element.value = "";
    }, selector);

    const element = await driver.findElement(By.css(selector));
    await element.sendKeys(text);

    return true;
  }

  /**
   * @description: wait for element appear and click
   */
  static async click(page: Page, selector: string, options = {}): Promise<boolean> {
    if (!(await PptrUnionUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    const check = !!options['check'];
    const driver = await PptrUnionUtils.getDriver(page);
    let element;
    let retryCount = check ? 10 : 1;

    let exist = await PptrUnionUtils.waitForSelector(page, selector, { timeout: 1000 });
    while (exist && retryCount-- > 0) {
      try {
        try {
          element = await driver.findElement(By.css(selector));
        } catch (e) {
          break;
        }
        await element.click();
        await bluebird.delay(200);
        exist = await PptrUnionUtils.waitForSelector(page, selector, { timeout: 1000 });
      } catch (err) {
        if (err && err.name === 'ElementClickInterceptedError') {
          await bluebird.delay(2000);
          await element.click();
        } else {
          if (retryCount <= 0) {
            throw err;
          }
        }
      }
    }

    return true;
  }

  static async hover(page: Page, selector: string, options = {}): Promise<boolean> {
    if (!(await PptrUnionUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    const driver = await PptrUnionUtils.getDriver(page);
    const element = await driver.findElement(By.css(selector));
    driver.actions().move({ duration: 500, origin: element }).perform();

    return true;
  }

  /**
   * @description: get element text
   */
  static async text(page: Page, selector: string, options = {}): Promise<any> {
    if (!(await PptrUnionUtils.waitForSelector(page, selector, options))) {
      return false;
    }

    const driver = await PptrUnionUtils.getDriver(page);
    const text = await driver.executeScript((selector) => {
      const element = document.querySelector(selector);
      let text = element.value;
      if (text) {
        return text;
      }
      return element.innerHTML;
    }, selector);

    return text;
  }

  static async attr(page: Page, selector: string, name: string) {
    if (!(await PptrUnionUtils.waitForSelector(page, selector))) {
      return false;
    }

    const driver = await PptrUnionUtils.getDriver(page);
    const value = await driver.executeScript((selector, name) => {
      const elements = document.querySelectorAll(selector);
      const element = elements[elements.length - 1];
      return element.getAttribute(name);
    }, selector, name);

    return value;

  }

  static async launch(options = {}): Promise<Browser> {
    let defaultArgs = ["--ignore-certificate-errors", "--disable-web-security"];
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

    const context = browser.defaultBrowserContext();

    await context.overridePermissions(Config.jupiterHost, ['notifications', 'microphone']);

    await PptrUnionUtils.injectMockServer(browser);

    const wsEndpoint = PptrUnionUtils.toEndpoint(browser.wsEndpoint());

    logger.info(
      `launch chrome success, wsEndpoint: ${wsEndpoint}, options: ${JSON.stringify(
        opt
      )}`
    );

    browsers.set(wsEndpoint, browser);

    const host = new URL(wsEndpoint).host;
    const chromeOptions = new chrome.Options();
    chromeOptions['options_']['debuggerAddress'] = host;
    const driver = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    drivers.set(wsEndpoint, driver);

    return browser;
  }

  static async connect(wsEndpoint: string): Promise<Browser> {
    try {
      wsEndpoint = PptrUnionUtils.toEndpoint(wsEndpoint);
      let browser = browsers.get(wsEndpoint);
      if (browser) {
        logger.info(`get chrome connection from cache, wsEndpoint: ${wsEndpoint}`);
        return browser;
      }

      browser = await puppeteer.connect({
        defaultViewport: null,
        browserWSEndpoint: wsEndpoint,
        ignoreHTTPSErrors: true
      });

      await PptrUnionUtils.injectMockServer(browser);

      wsEndpoint = PptrUnionUtils.toEndpoint(wsEndpoint);

      logger.info(`connect chrome success, wsEndpoint: ${wsEndpoint}`);

      browsers.set(wsEndpoint, browser);

      const host = new URL(wsEndpoint).host;
      const chromeOptions = new chrome.Options();
      chromeOptions['options_']['debuggerAddress'] = host;
      const driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

      drivers.set(wsEndpoint, driver);

      return browser;
    } catch (err) { }
    return null;
  }

  static async close(browser: Browser) {
    if (browser) {
      const wsEndpoint = PptrUnionUtils.toEndpoint(browser.wsEndpoint());


      browsers.delete(wsEndpoint);
      drivers.delete(wsEndpoint);

      if (browser.isConnected()) {
        logger.info(`close chrome connection, wsEndpoint: ${wsEndpoint}`);

        await browser.close();
      }
    }
  }

  static async closeAll(): Promise<Browser> {

    browsers.forEach(async (browser, wsEndpoint) => {
      try {
        logger.info(`close chrome connection, wsEndpoint: ${wsEndpoint}`);
        drivers.delete(wsEndpoint);
        if (browser && browser.isConnected()) {
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

  private static async getDriver(page: Page): Promise<WebDriver> {
    const browser = page.browser();
    const target = page.target();
    const wsEndpoint = PptrUnionUtils.toEndpoint(browser.wsEndpoint());
    let driver = drivers.get(wsEndpoint);

    const targetWindow = `CDwindow-${target._targetId}`;
    let currentWindow, shouldSwitch;
    try {
      currentWindow = await driver.getWindowHandle();
      shouldSwitch = currentWindow != targetWindow;
    } catch (err) {
      shouldSwitch = true;
    }

    if (shouldSwitch) {
      await driver.switchTo().window(targetWindow);
    }
    return driver;
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
      .useInitialCache(Config.useInitialCache)
      .record(false)
      .replay(true);

    let requestId = await client.registerBrowser(initDto);

    logger.info(`mock requestId : ${requestId}`);

    client['requestId'] = requestId;

    browser.mockClient = client;

    FunctionUtils.bindEvent(browser, 'targetchanged', async target => {
      let page = await target.page();
      if (page) {
        await page.setExtraHTTPHeaders({ "x-mock-request-id": requestId });
      }
    });
  }
}

export { PptrUnionUtils };
