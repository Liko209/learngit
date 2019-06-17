import 'testcafe';
import {ClientFunction, Selector} from 'testcafe';
import {getLogger} from 'log4js';

const logger = getLogger('BaseWebComponent');
logger.level = 'info';

export abstract class BaseWebComponent {

  public self: Selector;
  constructor(protected t: TestController) { }


  // delegate testcafe method
  get exists() {
    return this.self.exists;
  }

  get visible() {
    return this.self.visible;
  }

  get textContent() {
    return this.self.textContent;
  }

  getAttribute(attributeName: string) {
    return this.self.getAttribute(attributeName);
  }

  async clickSelf(options?: ClickActionOptions) {
    return this.t.click(this.self, options);
  }

  async hoverSelf(options?: ClickActionOptions) {
    return this.t.hover(this.self, options);
  }
}
