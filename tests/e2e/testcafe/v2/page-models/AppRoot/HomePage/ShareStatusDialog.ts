import { BaseWebComponent } from '../../BaseWebComponent';
import { SearchComoBox } from './SearchComboBox';

export class ShareStatusDialog extends BaseWebComponent {

  get self() {
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle').withText('Share Status');
  }

  get customItems() {
    return this.getSelectorByAutomationId('shareStatusMenuItem').withText('Out of office');
  }

  async clickTheFirstCustomItem() {
    await this.t.click(this.customItems);
  }

  get saveButton() {
    return this.getSelectorByAutomationId('DialogOKButton');
  }

  async clickSaveButton() {
    await this.t.click(this.saveButton);
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('DialogCancelButton');
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  get clearButton() {
    return this.getSelectorByAutomationId('clearStatusBtn');
  }

  async clickClearButton() {
    await this.t.click(this.clearButton);
  }

  get emojiButton() {
    return this.getSelectorByAutomationId('conversation-chatbar-emoji-button');
  }

  async clickEmojiButton() {
    await this.t.click(this.emojiButton);
  }

  get inputField() {
    return this.getSelectorByAutomationId('ShareCustomStatusInputField');
  }

  async typeStatusKeyword(text: string, options: TypeActionOptions = { replace: true, paste: true }) {
    await this.t.typeText(this.inputField, text, options);
  }

}


