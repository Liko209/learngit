/*
 * @Author: doyle.wu
 * @Date: 2019-02-25 13:36:37
 */

import { Page } from './page';
import { PptrUtils } from '../utils';
import * as bluebird from 'bluebird';

class HomePage extends Page {
  private unreadOnlyToggler: string = 'li[data-test-automation-id="unreadOnlyToggler"]';

  async waitForCompleted() {
    let page = await this.page();
    await PptrUtils.waitForSelector(page, this.unreadOnlyToggler);

    await bluebird.delay(5000);
  }
}

export {
  HomePage
}
