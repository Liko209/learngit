/*
 * @Author: allen.lian
 * @Date: 2019-08-29 10:59:34
 * Copyright © RingCentral. All rights reserved.
 */



import { BaseWebComponent } from "../../../BaseWebComponent";

export class CompanyDirectoryPage extends BaseWebComponent {
    get self() {
      return this.getSelectorByAutomationId('CompanyDirectoryHeader').parent('div');
    }
  
    get header() {
      return this.getSelectorByAutomationId('CompanyDirectoryPageHeader');
    }
  
    get headerTitle() {
      return this.getSelectorByAutomationId('conversation-page-header-title', this.header);
    }
  
  
    get scrollDiv() {
      return this.getSelectorByAutomationId('virtualized-list');
    }

    get items() {
      return this.getSelectorByAutomationClass('contacts-all-contacts-cell');
    }
  
  
    companydirectoryItemByNth(n: number) {
      return this.getComponent(CompanyDirectoryItem, this.items.nth(n));
    }

    companyDirectoryItemById(id: string) {
      return this.getComponent(CompanyDirectoryItem, this.items.filter(`[data-id="${id}"]`));
    }
  
  }


  class CompanyDirectoryItem extends BaseWebComponent {
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
      return this.getSelectorByAutomationId('companyDirectory-message-button', this.self);
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
  }