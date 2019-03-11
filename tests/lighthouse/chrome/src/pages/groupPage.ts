/*
 * @Author: doyle.wu
 * @Date: 2018-12-11 11:59:00
 */
import { Page } from "./page";
import { PptrUtils } from '../utils';

class GroupPage extends Page {
  private conversationItem: string =
    "div.conversation-list-section li.conversation-list-item";

  async waitForCompleted() {
    let page = await this.page();
    await PptrUtils.waitForSelector(page, this.conversationItem);
  }
}

export { GroupPage };
