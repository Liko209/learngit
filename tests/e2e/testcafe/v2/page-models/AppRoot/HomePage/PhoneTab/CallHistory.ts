/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-06-26 10:23:18
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

  get headerTitle() {
    return this.getSelectorByAutomationId('conversation-page-header-title');
  }

  get scrollDiv() {
    return this.getSelectorByAutomationId('virtualized-list');
  }

  get emptyPage() {
    return this.getSelectorByAutomationId('callHistoryEmptyPage');
  }

  get items() {
    return this.getSelectorByAutomationClass('call-history-item');
  }

  callHistoryItemByNth(n: number) {
    return this.getComponent(CallHistoryItem, this.items.nth(n));
  }

  get moreIcon() {
    return this.getSelectorByAutomationId('callHistory-header-more',this.self);
  }

  get deleteAllCallButton() {
    return this.getSelectorByAutomationId('delete-all-button');
  }

  async clickMoreIcon() {
    await this.t.click(this.moreIcon);
  }

  async clickDeleteAllCallButton() {
    await this.t.click(this.deleteAllCallButton);
  }

  callHistoryItemById(id: string) {
    return this.getComponent(CallHistoryItem, this.items.filter(`[data-id="${id}"]`));
  }

}

class CallHistoryItem extends BaseWebComponent {
  get id() {
    return this.self.getAttribute('data-id');
  }

  get avatar() {
    return this.self.find('[uid]');
  }

  get uid() {
    return this.avatar.getAttribute('uid')
  }

  get callerName() {
    return this.self.find('.list-item-primary');
  }

  get callerNumber() {
    return this.self.find('.list-item-secondary');
  }

  get moreMenuButton() {
    return this.getSelectorByAutomationId('calllog-more-button', this.self);
  }

  get deleteButton() {
    return this.getSelectorByAutomationId('calllog-delete-button');
  }

  async openMoreMenu() {
    await this.t.hover(this.self).click(this.moreMenuButton);
  }

  async clickDeleteButton() {
    await this.t.click(this.deleteButton);
  }
}

export class DeleteAllCalllDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId("deleteAllCallLogConfirmDialog");
  }

  get title() {
    return this.getSelectorByAutomationId("DialogTitle", this.self)
  }

  get content() {
    return this.getSelectorByAutomationId("DialogContent", this.self)
  }

  get cancelButton() {
    return this.getSelectorByAutomationId("deleteAllCallLogCancelButton", this.self)
  }

  get deleteButton() {
    return this.getSelectorByAutomationId("deleteAllCallLogOkButton", this.self)
  }

  async clickCancelButton() {
    return this.t.click(this.cancelButton);
  }

  async clickDeleteButton() {
    return this.t.click(this.deleteButton);
  }

}

export class DeleteCallHistoryDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId("deleteCallLogConfirmDialog");
  }

  get title() {
    return this.getSelectorByAutomationId("DialogTitle", this.self)
  }

  get content() {
    return this.getSelectorByAutomationId("DialogContent", this.self)
  }

  get cancelButton() {
    return this.getSelectorByAutomationId("deleteCallLogCancelButton", this.self)
  }

  get deleteButton() {
    return this.getSelectorByAutomationId("deleteCallLogOkButton", this.self)
  }

  async clickCancelButton() {
    return this.t.click(this.cancelButton);
  }

  async clickDeleteButton() {
    return this.t.click(this.deleteButton);
  }

}

