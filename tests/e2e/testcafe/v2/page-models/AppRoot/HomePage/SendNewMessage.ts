import { BaseWebComponent } from '../../BaseWebComponent';
import * as faker from 'faker/locale/en';

export class SendNewMessageModal extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
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

  async setMember(name: string) {
    await this.clickAndTypeText(this.membersInput, name, { replace: true, paste: true });
    // FIXME: Need time to wait for search members to display
    await this.t.wait(1000);
    await this.t.pressKey('enter');
  }

  async setNewMessage(message: string) {
    await this.clickAndTypeText(this.newMessageTextarea, `${message}`, { replace: true, paste: true });
  }

  async randomMessage(num: number) {
    return faker.random.alphaNumeric(num);
  }

  get membersInput() {
    return this.self.find('#downshift-multiple-input');
  }

  async typeMember(text: string, options?) {
    await this.clickAndTypeText(this.membersInput, text, options)
  }

  get selectedMembers() {
    this.warnFlakySelector();
    return this.self.find('*[role="button"]').withAttribute('uid');
  }

  async removeSelectedMember(n: number = -1) {
    await this.t.click(this.selectedMembers.nth(n).find('button'));
  }

  get lastSelectedMemberId() {
    return this.selectedMembers.nth(-1).getAttribute('uid');
  }

  get lastSelectedMemberName() {
    return this.selectedMembers.nth(-1).find('.label');
  }

  async lastSelectedMemberNameShouldBe(name: string) {
    await this.t.expect(this.lastSelectedMemberName.withText(name)).ok();
  }

  get contactSearchSuggestionsList() {
    return this.getSelectorByAutomationId("contactSearchSuggestionsList");
  }

  get contactSearchItems() {
    return this.contactSearchSuggestionsList.find('li');
  }

  async selectMemberByNth(n: number) {
    await this.t.click(this.contactSearchItems.nth(n));
  }

  async selectMemberByName(name: string) {
    await this.t.click(this.contactSearchItems.find('.primary').withText(name));
  }

  async selectMemberByEmail(email: string) {
    await this.t.click(this.contactSearchItems.find('.secondary').withText(email));
  }
}