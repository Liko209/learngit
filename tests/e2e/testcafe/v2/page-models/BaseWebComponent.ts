import * as _ from 'lodash'
import 'testcafe';
import { Selector, ClientFunction } from 'testcafe';

import * as assert from 'assert';
import { h, H } from '../helpers'
import { getLogger } from 'log4js';

const logger = getLogger('BaseWebComponent');
logger.level = 'info';

export abstract class BaseWebComponent {

  public self: Selector;
  constructor(protected t: TestController) { }

  get h() {
    return h(this.t);
  }

  async ensureLoaded(timeout: number = 10e3) {
    await H.retryUntilPass(async () => {
      await this.t.expect(this.exists).ok({ timeout });
      await this.t.expect(this.visible).ok();
    });
  }

  async ensureDismiss(timeout: number = 10e3) {
    await this.t.expect(this.self.with({ visibilityCheck: true }).exists).notOk({timeout});
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

  get focused() {
    return this.self.focused
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

  async clickSelf(options?: ClickActionOptions) {
    return this.t.click(this.self, options);
  }

  async hoverSelf(options?: ClickActionOptions) {
    return this.t.hover(this.self, options);
  }

  async enter() {
    await this.t.click(this.self);
    await this.waitForAllSpinnersToDisappear();
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

  getSelectorByAutomationIdUnderSelf(automationId: string): Selector {
    return this.getSelectorByAutomationId(automationId, this.self);
  }

  getSelectorByAutomationClass(automationId: string, root: Selector = null): Selector {
    return this.getSelector(`*[data-test-automation-class="${automationId}"]`, root);
  }

  getSelectorByAutomationValue(automationId: string, root: Selector = null): Selector {
    return this.getSelector(`*[data-test-automation-value="${automationId}"]`, root);
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
    return this.getSelector('div[role="progressbar"]:not([data-test-automation-id="conversation-list-spinner"])');
  }

  get conversationListSpinner() {
    return this.getSelectorByAutomationId('conversation-list-spinner');
  }

  get tooltip() {
    return this.getSelector('[role="tooltip"]');
  }

  async waitForAllSpinnersToDisappear(timeout: number = 30e3) {
    try {
      await H.retryUntilPass(async () => assert(await this.spinners.count > 0), 4);
    } catch (e) {
      // it's ok if spinner doesn't exist
    }
    finally {
      await this.t.expect(this.spinners.exists).notOk({ timeout });
    }
  }

  buttonOfText(text: string) {
    return this.self.find('button').withText(text);
  }

  async shouldHaveButtonOfText(text: string) {
    await this.t.expect(this.buttonOfText(text).exists).ok();
  }

  buttonOfIcon(icon: string) {
    return this.getSelectorByIcon(icon, this.self).parent('button');
  }

  checkboxOf(sel: Selector) {
    return sel.find('input[type="checkbox"]');
  }

  async quitByPressEsc() {
    await this.t.pressKey('esc');
  }

  // misc
  warnFlakySelector() {
    const stack = (new Error()).stack;
    logger.warn(`a flaky selector is found ${stack.split('\n')[2].trim()}`);
  }

  // Some specific scenarios
  async getNumber(sel: Selector) {
    // there is a chance that UMI won't update immediately
    await this.t.wait(1e3);
    if (!await sel.exists) {
      return 0;
    }
    const text = await sel.innerText;
    if (_.isEmpty(text)) {
      return 0;
    }
    if (text == '99+') {
      return 100;
    }
    return +text;
  }

  // hover some selector will show
  async showTooltip(text: string) {
    await this.t.expect(this.getSelector('[role="tooltip"]').withExactText(text).exists).ok();
  }

  async scrollIntoView() {
    await ClientFunction((_self) => {
      const ele: any = _self()
      ele.scrollIntoView()
    })(this.self)
  }
}

export class Umi extends BaseWebComponent {
  async count() {
    return await this.getNumber(this.self);
  }

  async shouldBeNumber(n: number, maxRetry = 5, interval = 3e3) {
    await H.retryUntilPass(async () => {
      const umi = await this.count();
      assert.strictEqual(n, umi, `UMI Number error: expect ${n}, but actual ${umi}`);
    }, maxRetry, interval);
  }

  async shouldBeAtMentionStyle() {
    await H.retryUntilPass(async () => {
      const umiStyle = await this.self.style;
      const umiBgColor = umiStyle['background-color'];
      assert.strictEqual(umiBgColor, 'rgb(255, 136, 0)', `${umiBgColor} not eql specify: rgb(255, 136, 0)`)
    });
  }

  async shouldBeNotAtMentionStyle() {
    await H.retryUntilPass(async () => {
      const umiStyle = await this.self.style;
      const umiBgColor = umiStyle['background-color'];
      assert.strictEqual(umiBgColor, 'rgb(158, 158, 158)', `${umiBgColor} not eql specify: rgb(158, 158, 158)`)
    });
  }
}
