import * as _ from 'lodash'
import 'testcafe';
import { Selector } from 'testcafe';

import * as assert from 'assert';
import { H } from '../helpers'
import { getLogger } from 'log4js';

const logger = getLogger('BaseWebComponent');
logger.level = 'info';

export abstract class BaseWebComponent {

  public self: Selector;
  constructor(protected t: TestController) { }

  async ensureLoaded(timeout: number = 5e3) {
    await this.t.expect(this.exists).ok({ timeout });
  }

  async waitUntilExist(selector: Selector | BaseWebComponent, timeout: number = 5e3) {
    await this.t
      .expect(selector.exists)
      .ok(`fail to locate selector ${selector} within ${timeout} ms`, { timeout });
  }

  async waitUntilVisible(selector: Selector | BaseWebComponent, timeout: number = 5e3) {
    await this.t
      .expect(selector.visible)
      .ok(`selector ${selector} is not visible within ${timeout} ms`, { timeout });
  }

  // sandbox and helper
  async clickAndTypeText(selector: Selector, text: string, options?: TypeActionOptions) {
    return await this.t.click(selector).typeText(selector, text, options)
  }

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

  get findSelector() {
    return this.self.find;
  }

  getComponent<T extends BaseWebComponent>(ctor: { new(t: TestController): T }, root: Selector = null): T {
    const component = new ctor(this.t);
    if (root) {
      component.self = root;
    }
    assert(component.self, "component's root should not be empty");
    return component;
  }

  getSelector(select: string, root: Selector = null) {
    if (root) {
      return root.find(select);
    } else {
      return Selector(select);
    }
  }

  getSelectorByAutomationId(automationId: string, root: Selector = null): Selector {
    return this.getSelector(`*[data-test-automation-id="${automationId}"]`, root);
  }

  getSelectorByAnchor(anchor: string, root: Selector = null): Selector {
    return this.getSelector(`*[data-anchor="${anchor}"]`, root);
  }

  getSelectorByIcon(icon: string, root: Selector = null): Selector {
    if (root) {
      return root.find(`.icon.${icon}`)
    } else {
      return this.self.find(`.icon.${icon}`);
    }
  }

  get spinners() {
    return this.getSelector('div[role="progressbar"]');
  }

  async waitForAllSpinnersToDisappear(timeout: number = 30e3) {
    try {
      await H.retryUntilPass(async () => assert(await this.spinners.count > 0), 4);
    } catch (e) {
      // it's ok if spinner doesn't exist
    }
    finally {
      await this.t.expect(this.spinners.count).eql(0, { timeout });
    }
  }

  button(name: string) {
    return this.self.find('button').withText(name);
  }

  checkboxOf(sel: Selector) {
    return sel.find('input[type="checkbox"]');
  }

  // misc
  warnFlakySelector() {
    const stack = (new Error()).stack;
    logger.warn(`a flaky selector is found ${stack.split('\n')[2].trim()}`);
  }

  // Some specific scenarios
  async getNumber(sel: Selector) {
    if (await sel.exists == false) {
      return 0;
    }
    const text = await sel.innerText;
    if (_.isEmpty(text)) {
      return 0;
    }
    if (text == '99+') {
      return 100;
    }
    return Number(text);
  }

  // hover some selector will show
  async showTooltip(text: string) {
    await this.t.expect(this.getSelector('[role="tooltip"]').withExactText(text).exists).ok();
  }
}
