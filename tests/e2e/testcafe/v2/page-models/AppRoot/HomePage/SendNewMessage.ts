
import * as faker from 'faker/locale/en';
import { BaseWebComponent } from '../../BaseWebComponent';
import { SearchComoBox } from './SearchComboBox';

export class SendNewMessageModal extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.self.find('h2');
  }

  get createMessageButton() {
    this.warnFlakySelector();
    return this.self.find('button').nth(1);
  }

  get cancelButton() {
    this.warnFlakySelector();
    return this.self.find('button').nth(0);
  }

  get sendButton() {
    this.warnFlakySelector();
    return this.self.find('button').nth(-1);
  }

  get newMessageTextarea() {
    return this.getSelectorByAutomationId('newMessageTextarea').find('textarea');
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickSendButton() {
    await this.t.click(this.sendButton);
  }

  get isDisable(): Promise<boolean> {
    return this.createMessageButton.hasAttribute('disabled');
  }

  async sendButtonShouldBeDisabled() {
    await this.t.expect(this.isDisable).ok();
  }

  async sendButtonShouldBeEnabled() {
    await this.t.expect(this.isDisable).notOk();
  }

  async setNewMessage(message: string) {
    await this.clickAndTypeText(this.newMessageTextarea, `${message}`, { replace: true, paste: true });
  }

  async randomMessage(num: number) {
    return faker.random.alphaNumeric(num);
  }

  get memberInput() {
    return this.getComponent(SearchComoBox, this.self.find('*[role="combobox"]'));
  }

}