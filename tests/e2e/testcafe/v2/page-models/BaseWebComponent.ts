import * as _ from 'lodash'
import 'testcafe';
import { Selector } from 'testcafe';

import { IUser } from '../models'
import { h } from '../helpers'
import * as assert from 'assert';

export abstract class BaseWebComponent {

    public root: Selector;
    constructor(public t: TestController) { }

    async ensureLoaded() {
        console.error('You should overwrite this method to ensure component is loaded before execute other operations');
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

    get exists() {
        return this.root.exists;
    }

    get visible() {
        return this.root.visible;
    }

    // testcafe actions
    async click(cb: (c) => Selector) {
        await this.t.click(cb(this));
    }

    // jupiter
    async directLoginWithUser(url: string, user: IUser) {
        const urlWithAuthCode = await h(this.t).jupiterHelper.getUrlWithAuthCode(url, user);
        await this.t.navigateTo(urlWithAuthCode);
    }

    getComponent<T extends BaseWebComponent>(ctor: { new(t: TestController): T }, root: Selector = null): T {
        const component = new ctor(this.t);
        if (root) {
            component.root = root;
        }
        assert(component.root, "component's root should not be empty");
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

    // misc
    warnFlakySelector() {
        const stack = (new Error()).stack;
        console.error('a flaky selector is found:');
        console.error(stack);
    }

}