/*
 * @Author: isaac.liu
 * @Date: 2019-05-28 10:23:06
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseWebComponent } from "../../../BaseWebComponent";

export class CallHistoryPage extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('CallHistoryPageHeader').parent('div');
  }

  get header() {
    return this.getSelectorByAutomationId('CallHistoryPageHeader');
  }

  get moreIcon() {
    return this.getSelectorByAutomationId('voicemail-more-button');
  }

  get deleteAllCallButon() {
    return this.getSelectorByAutomationId('delete-all-button');
  }

  get items() {
    return this.getSelector('[data-test-automation-class="callHistory-item"]')
  }

  async clickDeleteAllButton() {
    return this.t.click(this.deleteAllCallButon);
  }

}

