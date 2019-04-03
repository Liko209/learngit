/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 13:14:36
 */

import { PptrUtils } from '../utils'

class Page {
  private _browser;
  private _page;

  protected wsEndpoint: string;
  protected passContext: any;

  constructor(options: {
    wsEndpoint?: string,
    passContext?: any,
    browser?: any
  }) {
    let {
      wsEndpoint, passContext, browser
    } = options;

    this.wsEndpoint = wsEndpoint;
    this.passContext = passContext;
    this._browser = browser;
  }

  async browser() {
    if (this._browser) {
      return this._browser;
    }

    let ws;
    if (this.wsEndpoint) {
      ws = this.wsEndpoint;
    } else {
      let driver = this.passContext.driver;
      ws = await driver.wsEndpoint();
    }

    this._browser = await PptrUtils.connect(ws);
    return this._browser;
  }

  async page() {
    if (this._page) {
      return this._page;
    }

    let browser = await this.browser();
    let pages = await browser.pages();

    if (pages && pages.length > 0) {
      for (const p of pages) {
        if (await p.evaluate(() => { return document.visibilityState == 'visible' })) {
          this._page = p;
          break;
        }
      }
    }
    return this._page;
  }

  async goto(url: string) {
    let page = await this.page();
    await page.goto(url);
  }

  async waitForCompleted() {
  }
}

export {
  Page
}
