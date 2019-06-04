/*
 * @Author: doyle.wu
 * @Date: 2019-05-23 14:35:59
 */
import { Selector, ClientFunction } from 'testcafe';

const _scrollBy: ClientFunction = ClientFunction((selector: string, x: number, y: number) => {
  const node = document.querySelector(selector);
  if (node) {
    node.scrollBy(x, y);
  }
});

class Page {
  protected t: TestController;

  protected selectorOpt: SelectorOptions;

  private boundScrollBy: ClientFunction;

  constructor(t: TestController) {
    this.t = t;
    this.selectorOpt = <SelectorOptions>{
      boundTestRun: this.t,
      timeout: 120e3
    };

    this.boundScrollBy = _scrollBy.with({ boundTestRun: this.t });
  }

  async ensureLoaded() {
    await this.waitUntilExist(Selector(`div[data-name="Direct Messages"] li`));
  }

  async waitUntilExist(selector: Selector, timeout: number = 120e3) {
    await this.t
      .expect(selector.exists)
      .ok(`fail to locate selector ${selector} within ${timeout} ms`, { timeout });
  }

  async waitUntilVisible(selector: Selector, timeout: number = 120e3) {
    await this.t
      .expect(selector.visible)
      .ok(`selector ${selector} is not visible within ${timeout} ms`, { timeout });
  }

  async scrollBy(selector: string, x: number, y: number) {
    await this.boundScrollBy(selector, x, y);
  }
}

export {
  Page
}
