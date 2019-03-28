/*
 * @Author: doyle.wu
 * @Date: 2018-12-14 09:10:38
 */
import { PptrUtils } from '../utils';

class Page {
  private _browser;
  private _page;

  protected passContext: any;

  constructor(passContext: any) {
    this.passContext = passContext;
  }

  async browser() {
    if (this._browser) {
      return this._browser;
    }

    let driver = this.passContext.driver;
    let ws = await driver.wsEndpoint();
    this._browser = await PptrUtils.connect(ws);
    return this._browser;
  }

  async close() {
    let page = await this.page();
    if (page) {
      await page.close();
    }
  }

  async page() {
    if (this._page) {
      return this._page;
    }
    let browser = await this.browser();
    let pages = await browser.pages();

    if (!pages || pages.length == 0) {
      this._page = await browser.newPage();
    } else {
      for (const p of pages) {
        if (await p.evaluate(() => { return document.visibilityState == 'visible' })) {
          this._page = p;
          break;
        }
      }
    }
    return this._page;
  }

  async newPage() {
    let browser = await this.browser();
    this._page = await browser.newPage();
    return this._page;
  }

  async waitForCompleted() {
  }
}

export {
  Page
}
