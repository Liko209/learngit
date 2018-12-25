import * as _ from 'lodash'
import 'testcafe';
import { Selector } from 'testcafe';

import { IUser } from '../models'
import { h } from '../helpers'
import * as assert from 'assert';
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

  // jupiter
  async directLoginWithUser(url: string, user: IUser) {
    const urlWithAuthCode = await h(this.t).jupiterHelper.getUrlWithAuthCode(url, user);
    await this.t.navigateTo(urlWithAuthCode);
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
      return root.find('.material-icons').withText(icon);
    } else {
      return this.self.find('.material-icons').withText(icon);
    }
  }

  // misc
  warnFlakySelector() {
    const stack = (new Error()).stack;
    logger.warn(`a flaky selector is found ${stack.split('\n')[2].trim()}`);
  }

}