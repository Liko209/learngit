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
    return this.getSelectorByAutomationId('conversation-page-header-title', this.header);
  }

  get filter() {
    return this.getSelectorByAutomationId('phoneFilter');
  }

  get filterInput() {
    return this.getSelectorByAutomationId('phoneFilter').find('input');
  }

  get filterInputClear() {
    return this.getSelectorByAutomationId('close', this.filter);
  }

  get missedCallTab() {
    return this.getSelectorByAutomationId('CallHistoryMissedCalls');
  }

  get allCallTab() {
    return this.getSelectorByAutomationId('CallHistoryAllCalls');
  }

  get scrollDiv() {
    return this.getSelectorByAutomationId('virtualized-list');
  }

  get emptyPage() {
    return this.getSelectorByAutomationId('callHistoryEmptyPage');
  }

  get allCallsItems() {
    return this.getSelector('[data-type="1"]').find('[data-test-automation-class="call-history-item"]');
  }

  get missedCallsItems() {
    return this.getSelector('[data-type="2"]').find('[data-test-automation-class="call-history-item"]');
  }

  get items() {
    return this.getSelectorByAutomationClass('call-history-item');
  }

  callHistoryItemByNth(n: number) {
    return this.getComponent(CallHistoryItem, this.items.nth(n));
  }

  get moreIcon() {
    return this.getSelectorByAutomationId('callHistory-header-more', this.self);
  }

  get deleteAllCallButton() {
    return this.getSelectorByAutomationId('delete-all-button');
  }

  callHistoryItemById(id: string) {
    return this.getComponent(CallHistoryItem, this.items.filter(`[data-id="${id}"]`));
  }

  /** actions */
  async clickMoreIcon() {
    await this.t.click(this.moreIcon);
  }

  async clickDeleteAllCallButton() {
    await this.t.click(this.deleteAllCallButton);
  }

  async typeFilter(text: string, options: TypeActionOptions = { replace: true, paste: true }) {
    await this.clickAndTypeText(this.filterInput, text, options);
  }

  async expectItemsWithNameExist(name: string) {
    await this.t.expect(this.items.find('.list-item-primary').withText(name).exists).ok();
  }

  async expectItemsWithNameNotExist(name: string) {
    await this.t.expect(this.items.find('.list-item-primary').withText(name).exists).notOk();
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

  get messageButton() {
    return this.getSelectorByAutomationId('calllog-message-button', this.self);
  }

  async hoverMessageButton() {
    await this.t.hover(this.self).hover(this.messageButton);
  }

  async ClickMessageButton() {
    await this.t.hover(this.self).click(this.messageButton);
  }

  get callbackButton() {
    return this.getSelectorByAutomationId('calllog-call-button', this.self);
  }

  async hoverCallBackButton() {
    await this.t.hover(this.self).hover(this.callbackButton);
  }

  async ClickCallbackButton() {
    await this.t.hover(this.self).click(this.callbackButton);
  }

  get deleteButton() {
    return this.getSelectorByAutomationId('calllog-delete-button');
  }

  async hoverDeleteButton() {
    await this.t.hover(this.self).hover(this.deleteButton);
  }

  async openMoreMenu() {
    await this.t.hover(this.self).click(this.moreMenuButton);
  }

  async clickDeleteButton() {
    await this.t.click(this.deleteButton);
  }



  get deleteToggle() {
    return this.getSelectorByAutomationId('calllog-delete-button');
  }

  get blockToggle() {
    return this.getSelectorByAutomationId('calllog-block-button');
  }

  get blockButton() {
    return this.getSelectorByIcon('blocked', this.blockToggle);
  }

  get unblockButton() {
    return this.getSelectorByIcon('unblocked', this.blockToggle);
  }

  async clickBlockButton() {
    await this.t.click(this.blockButton);
  }

  async hoverBlockButton() {
    await this.t.hover(this.blockButton);
  }

  async clickUnblockButton() {
    await this.t.click(this.unblockButton);
  }

  async hoverUnblockButton() {
    await this.t.hover(this.unblockButton);
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

