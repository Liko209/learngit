/*
 * @Author: doyle.wu
 * @Date: 2019-06-11 09:18:15
 */
import { Page } from "./page";
import * as bluebird from "bluebird";
import { PptrUtils } from '../utils';

class DialerPage extends Page {
  private conversationItem: string = "div.conversation-list-section li.conversation-list-item";

  private telePhonyEndBtn: string = 'button[data-test-automation-id="telephony-end-btn"]';

  private telePhonyOpenBtn: string = 'button[data-test-automation-id="telephony-dialpad-btn"]';

  private telePhonyCloseBtn: string = 'button[data-test-automation-id="telephony-minimize-btn"]';

  private telePhonyInput: string = 'div[data-test-automation-id="telephony-dialer-header"] input';

  private telePhonyDeleteBtn: string = 'div[data-test-automation-id="telephony-dialer-header"] button[aria-label="Delete"]';

  private telePhonyItem: string = 'li[data-test-automation-id="telephony-contact-search-list_item"]';

  async waitForCompleted(): Promise<boolean> {
    let page = await this.page();
    return await PptrUtils.waitForSelector(page, this.conversationItem);
  }

  async openDialer(): Promise<boolean> {
    let page = await this.page();

    await PptrUtils.click(page, this.telePhonyOpenBtn);

    if (await PptrUtils.waitForSelector(page, this.telePhonyEndBtn)) {
      return true;
    }

    await PptrUtils.click(page, this.telePhonyOpenBtn);

    return await PptrUtils.waitForSelector(page, this.telePhonyEndBtn);
  }

  async closeDialer(): Promise<boolean> {
    let page = await this.page();

    await PptrUtils.click(page, this.telePhonyCloseBtn);

    return await PptrUtils.disappearForSelector(page, this.telePhonyEndBtn);
  }

  async searchByPhone(keyword: string) {
    let page = await this.page();

    await PptrUtils.click(page, this.telePhonyInput);

    await PptrUtils.setText(page, this.telePhonyInput, keyword);

    await PptrUtils.waitForSelector(page, this.telePhonyItem);

    await PptrUtils.click(page, this.telePhonyDeleteBtn);

    await bluebird.delay(200);
  }
}

export {
  DialerPage
}
