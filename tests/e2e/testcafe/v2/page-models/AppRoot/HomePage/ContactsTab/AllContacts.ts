/*
 * @Author: allen.lian
 * @Date: 2019-08-29 10:59:37
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseWebComponent } from "../../../BaseWebComponent";

export class AllContactsPage extends BaseWebComponent { 
    get self() {
      return this.header.parent('div');
    }
  
    get header() {
      return this.getSelectorByAutomationId('conversation-page-header-title');
    }
  
    get headerTitle() {
      return this.getSelectorByAutomationId('conversation-page-header-title', this.header);
    }
  
  
    get scrollDiv() {
      return this.getSelectorByAutomationId('virtualized-list');
    }

    get items() {
      return this.self.find('[data-test-automation-id^="contacts-all-contacts-cell"]')
    }

  
    allcontactsItemByNth(n: number) {
      return this.getComponent(AllContactsItem, this.items.nth(n));
    }
  

    allContactsItemById(id: string) {
      return this.getComponent(AllContactsItem, this.items.filter(`[data-id="${id}"]`));
    }
  
  }


  class AllContactsItem extends BaseWebComponent {

    get id() {
      return this.self.getAttribute('data-id');
    }
  
    get avatar() {
      return this.self.find('[uid]');
    }
  
    get uid() {
      return this.avatar.getAttribute('uid')
    }
  
  
    get messageButton() {
      return this.getSelectorByAutomationId('allContacts-message-button', this.self);
    }
  
    async hoverMessageButton(){
      await this.t.hover(this.self).hover(this.messageButton);
    }
  
    async ClickMessageButton() {
      await this.t.hover(this.self).click(this.messageButton);
    }
  
    get callButton () {
      return this.getSelectorByAutomationId('0-call-button', this.self);
    }
  
    async hoverCallBackButton(){
      await this.t.hover(this.self).hover(this.callButton);
    }
  
    async ClickCallButton() {
      await this.t.hover(this.self).click(this.callButton);
    }

    get callerName() {
      return this.self.find('.list-item-primary');
    }

    get items() {
      // return this.self.find('[data-test-automation-id^="contacts-all-contacts-cell"]')
      return this.getSelectorByAutomationId('virtualized-list').find('[data-test-automation-id^="contacts-all-contacts-cell"]');
    }

    async ClickItem() {
      await this.t.click(this.items);
    }

  }