import * as _ from 'lodash'
import 'testcafe';
import { Selector } from 'testcafe';

import { IUser } from '../models'
import { h } from '../helpers'

export abstract class BaseWebComponent {

    constructor(public t: TestController) { }

    abstract get root(): Selector;

    async ensureLoaded() {
        console.error('You should overwrite this method to ensure component is loaded before execute other operations');
    }

    async waitUntilExist(selector: Selector, timeout: number = 5e3) {
        await this.t
            .expect(selector.exists)
            .ok(`fail to locate selector ${selector} within ${timeout} ms`, { timeout });
    }

    async waitUntilVisible(selector: Selector, timeout: number = 5e3) {
        await this.t
            .expect(selector)
            .ok(`selector ${selector} is not visible within ${timeout} ms`, { timeout });
    }

    // testcafe actions
    async click(cb: (c) => Selector) {
        await this.t.click(cb(this));
    }

    async navigateTo(url) {
        await this.t.navigateTo(url);
    }

    // jupiter
    async directLoginWithUser(url: string, user: IUser) {
        const urlWithAuthCode = await h(this.t).jupiterHelper.getUrlWithAuthCode(url, user);
        await this.navigateTo(urlWithAuthCode);
    }

    getComponent<T>(ctor: { new(t: TestController): T }): T {
        return new ctor(this.t);
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

}