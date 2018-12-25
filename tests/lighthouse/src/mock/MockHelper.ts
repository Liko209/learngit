/*
 * @Author: doyle.wu
 * @Date: 2018-12-25 09:30:26
 */
import { onRequest } from './RequestMocker';
import { functionUtils } from '../utils/FunctionUtils';


class MockHelper {
    private pages = new Array();
    private browsers = new Array();

    private targetChangedListener = async (target) => {
        let page = await target.page();
        if (page) {
            if (functionUtils.bindEvent(page, 'request', onRequest)) {
                await page.setRequestInterception(true);
                this.pages.push(page);
            }
        }
    };

    async register(browser) {
        if (functionUtils.bindEvent(browser, 'targetchanged', this.targetChangedListener)) {
            this.browsers.push(browser);
        }
    }

    async close() {
        for (let browser of this.browsers) {
            functionUtils.unbindEvent(browser, 'targetchanged', this.targetChangedListener);
        }
        for (let page of this.pages) {
            await page.setRequestInterception(false);
            functionUtils.unbindEvent(page, 'request', onRequest);
        }
    }
}

const mockHelper = new MockHelper();

export {
    mockHelper,
}