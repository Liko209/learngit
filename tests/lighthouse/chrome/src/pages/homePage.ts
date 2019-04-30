/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 11:59:00
 */
import { Page } from './page';
import { PptrUtils } from '../utils';

class HomePage extends Page {
  private topBarAvatar: string = 'div[data-test-automation-id="topBarAvatar"]';

  async waitForCompleted(): Promise<boolean> {
    let page = await this.page();
    return await PptrUtils.waitForSelector(page, this.topBarAvatar);
  }
}

export {
  HomePage
}
