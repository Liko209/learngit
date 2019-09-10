/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 11:59:00
 */
import { Page } from './page';
import { PptrUtils } from '../utils';

class HomePage extends Page {
  private conversationItem: string = "div.conversation-list-section li.conversation-list-item";

  async waitForCompleted(): Promise<boolean> {
    let page = await this.page();
    return await PptrUtils.waitForSelector(page, this.conversationItem);
  }
}

export {
  HomePage
}
