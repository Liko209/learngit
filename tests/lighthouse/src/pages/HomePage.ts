/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 11:59:00
 */
import { Page } from './Page';
import * as bluebird from 'bluebird';
class HomePage extends Page {
    private topBarAvatar: string = 'div[data-test-automation-id="topBarAvatar"]';

    async waitForCompleted() {
        let page = await this.page();
        await this.utils.waitForSelector(page, this.topBarAvatar);
    }
}

export {
    HomePage
}