/*
 * @Author: wayne.zhou
 * @Date: 2019-05-15 13:42:05
 * Copyright © RingCentral. All rights reserved.
 *
 * this code is taken from https://github.com/storybooks/storybook/blob/master/addons/storyshots/storyshots-puppeteer/package.json
 * in order to make some customization
 */
import puppeteer from 'puppeteer';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { logger } from '@storybook/node-logger';
import { constructUrl } from './url';

expect.extend({ toMatchImageSnapshot });

// We consider taking the full page is a reasonnable default.
const defaultScreenshotOptions = () => ({ fullPage: true });

const noop = () => {};
const asyncNoop = async () => {};

const defaultConfig = {
  storybookUrl: 'http://localhost:6006',
  chromeExecutablePath: undefined,
  getMatchOptions: noop,
  getScreenshotOptions: defaultScreenshotOptions,
  beforeScreenshot: noop,
  getGotoOptions: noop,
  customizePage: asyncNoop,
  getCustomBrowser: undefined,
};

function isExcluded(kind, name, config) {
  if (
    config.name.includes(name) ||
    config.kind.includes(kind) ||
    config.matchFunction({ kind, name })
  ) {
    console.log(`skip story ${kind} ${name}`);
    return true;
  }
}

export const imageSnapshot = (customConfig = {}) => {
  const {
    storybookUrl,
    chromeExecutablePath,
    getMatchOptions,
    getScreenshotOptions,
    beforeScreenshot,
    getGotoOptions,
    customizePage,
    excludeImageSnapshot,
    getCustomBrowser,
  } = { ...defaultConfig, ...customConfig };

  let browser; // holds ref to browser. (ie. Chrome)
  let page; // Hold ref to the page to screenshot.

  const testFn = async ({ context }) => {
    const { kind, framework, name } = context;
    if (isExcluded(kind, name, excludeImageSnapshot)) return;

    console.log(kind, name);

    if (framework === 'rn') {
      // Skip tests since we de not support RN image snapshots.
      logger.error(
        "It seems you are running imageSnapshot on RN app and it's not supported. Skipping test.",
      );

      return;
    }
    const url = constructUrl(storybookUrl, kind, name);

    if (!browser || !page) {
      logger.error(
        `Error when generating image snapshot for test ${kind} - ${name} : It seems the headless browser is not running.`,
      );

      throw new Error('no-headless-browser-running');
    }

    expect.assertions(1);

    let image;
    try {
      await customizePage(page);
      await page.goto(url, {
        ...getGotoOptions({ context, url }),
      });
      await beforeScreenshot(page, { context, url });
      image = await screenshotDOMElement(
        page,
        '#component',
        0,
        getScreenshotOptions({ context, url }),
      );
    } catch (e) {
      logger.error(e);
      logger.error(
        `Error when connecting to ${url}, did you start or build the storybook first? A storybook instance should be running or a static version should be built when using image snapshot feature.`,
        e,
      );
      throw e;
    }

    expect(image).toMatchImageSnapshot(getMatchOptions({ context, url }));
  };

  // take minimum area that contain the component to make screenshot
  async function screenshotDOMElement(page, selector, padding = 0, option) {
    // wait for component to load
    await page.waitFor(selector);

    if (option.fullPage) {
      console.log('full page screenshot');

      return await page.screenshot({
        ...option,
      });
    } else {
      const rect = await page.evaluate(selector => {
        const element = document.querySelector(selector);
        const { x, y, width, height } = element.getBoundingClientRect();
        return { left: x, top: y, width, height, id: element.id };
      }, selector);

      return await page.screenshot({
        clip: {
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        },
        ...option,
      });
    }
  }

  testFn.afterAll = () => {
    if (getCustomBrowser && page) {
      return page.close();
    }

    return browser.close();
  };

  testFn.beforeAll = async () => {
    if (getCustomBrowser) {
      browser = await getCustomBrowser();
    } else {
      // add some options "no-sandbox" to make it work properly on some Linux systems as proposed here: https://github.com/Googlechrome/puppeteer/issues/290#issuecomment-322851507
      browser = await puppeteer.launch({
        args: [
          '--no-sandbox ',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
        executablePath: chromeExecutablePath,
      });
    }

    page = await browser.newPage();
  };

  return testFn;
};
