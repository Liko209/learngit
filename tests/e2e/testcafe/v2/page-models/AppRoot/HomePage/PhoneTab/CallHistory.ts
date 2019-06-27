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
}
