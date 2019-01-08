/*
 * @Author: doyle.wu
 * @Date: 2018-12-25 09:30:26
 */
import { onRequest } from "./RequestInterceptor";
import { functionUtils } from "../utils/FunctionUtils";

class BrowserDto {
  browser: any;
  pages: Array<any>;
}

class MockHelper {
  private _switch: boolean = false;

  private browserMap: Map<string, BrowserDto> = new Map();

  private ws(browser): string {
    let ws = browser.wsEndpoint();
    return ws.replace("127.0.0.1", "localhost");
  }

  private targetChangedListener = async target => {
    let page = await target.page();
    if (page) {
      try {
        let browser = target.browser();
        let ws = this.ws(browser);
        if (!this.browserMap.has(ws)) {
          return;
        }

        let dto = this.browserMap.get(ws);
        if (functionUtils.bindEvent(page, "request", onRequest)) {
          await page.setRequestInterception(true);
          functionUtils.bindEvent(page, "close", () => {
            let idx = dto.pages.indexOf(page);
            if (idx >= 0) {
              dto.pages.splice(idx, 1);
            }
          });
          if (this._switch) {
            dto.pages.push(page);
          } else {
            functionUtils.unbindEvent(page, "request", onRequest);
            await page.setRequestInterception(false);
          }
        }
      } catch (err) {}
    }
  };

  async register(browser) {
    if (!this._switch || !browser) {
      return;
    }

    let ws = this.ws(browser);
    if (this.browserMap.has(ws)) {
      return;
    }
    if (
      functionUtils.bindEvent(
        browser,
        "targetchanged",
        this.targetChangedListener
      )
    ) {
      this.browserMap.set(ws, {
        browser: browser,
        pages: []
      });
    }
  }

  async unregister(browser) {
    if (!this._switch || !browser) {
      return;
    }

    let ws = this.ws(browser);
    if (!this.browserMap.has(ws)) {
      return;
    }

    let dto = this.browserMap.get(ws);
    functionUtils.unbindEvent(
      dto.browser,
      "targetchanged",
      this.targetChangedListener
    );
    for (let page of dto.pages) {
      functionUtils.unbindEvent(page, "request", onRequest);
      await page.setRequestInterception(false);
    }

    this.browserMap.delete(ws);
  }

  open() {
    if (process.env.MOCK_GLOBAL_SWITCH !== "true" || this._switch) {
      return;
    }
    this._switch = true;
  }

  async close() {
    if (!this._switch) {
      return;
    }
    this._switch = false;

    let dtoList = this.browserMap.values();
    for (let dto of dtoList) {
      functionUtils.unbindEvent(
        dto.browser,
        "targetchanged",
        this.targetChangedListener
      );
      for (let page of dto.pages) {
        functionUtils.unbindEvent(page, "request", onRequest);
        await page.setRequestInterception(false);
      }
    }

    this.browserMap.clear();
  }
}

const mockHelper = new MockHelper();

export { mockHelper };
