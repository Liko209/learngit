/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-01 15:21:39
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseWebComponent } from '../../BaseWebComponent';
import * as _ from 'lodash';
import * as faker from 'faker/locale/en';

export class CreateTeamModal extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get cancelButton() {
    this.warnFlakySelector();
    return this.self.find('button').nth(0);
  }

  get createButton() {
    return this.self.find('.modal-actions button').nth(1);
  }

  get teamNameInput() {
    return this.getSelectorByAutomationId("CreateTeamName");
  }

  get toggleList() {
    return this.getSelectorByAutomationId("CreateTeamToggleList");
  }
  get teamDescriptionInput() {
    return this.getSelectorByAutomationId("CreateTeamDescription");
  }

  async typeTeamName(teamName) {
    await this.clickAndTypeText(this.teamNameInput, teamName, { replace: true, });
  }

  randomString(length: number) {
    return faker.random.alphaNumeric(length);
  }

  async typeRandomTeamName(length: number) {
    await this.typeTeamName(this.randomString(length));
  }

  async typeRandomTeamDescription(length: number) {
    await this.clickAndTypeText(this.teamDescriptionInput, this.randomString(length), { replace: true, })
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickCreateButton() {
    await this.t.expect(this.createButton.hasAttribute('disabled')).notOk().click(this.createButton);
  }

  get membersInput() {
    return this.self.find('#downshift-multiple-input');
  }

  async typeMember(text: string, options?) {
    await this.clickAndTypeText(this.membersInput, text, options);
  }

  async addMember(name: string) {
    await this.typeMember(name, { paste: true });
    await this.t.wait(3e3);
    await this.selectMemberByNth(0);
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

  get isPublicDiv() {
    return this.getSelectorByAutomationId('CreateTeamIsPublic').parent('li');
  }

  get mayAddMemberDiv() {
    return this.getSelectorByAutomationId('CreateTeamCanAddMember').parent('li');
  }

  get mayPostMessageDiv() {
    return this.getSelectorByAutomationId('CreateTeamCanPost').parent('li');
  }

  get mayPinPostDiv() {
    return this.getSelectorByAutomationId('CreateTeamCanPinPost').parent('li');
  }

  get isPublicToggle() {
    return this.checkboxOf(this.isPublicDiv);
  }

  get mayAddMemberToggle() {
    return this.checkboxOf(this.mayAddMemberDiv);
  }

  get mayPostMessageToggle() {
    return this.checkboxOf(this.mayPostMessageDiv);
  }

  get mayPinPostToggle() {
    return this.checkboxOf(this.mayPinPostDiv);
  }

  private async toggle(checkbox: Selector, check: boolean) {
    const isChecked = await checkbox.checked;
    if (isChecked != check) {
      await this.t.click(checkbox);
    }
  }

  async turnOnIsPublic() {
    await this.toggle(this.isPublicToggle, true);
  }

  async turnOffIsPublic() {
    await this.toggle(this.isPublicToggle, false);
  }

  async turnOnMayAddMember() {
    await this.toggle(this.mayAddMemberToggle, true);
  }

  async turnOffMayAddMember() {
    await this.toggle(this.mayAddMemberToggle, false);
  }

  async turnOnMayPostMessage() {
    await this.toggle(this.mayPostMessageToggle, true);
  }

  async turnOffMayPostMessage() {
    await this.toggle(this.mayPostMessageToggle, false);
  }

  async turnOnMayPinPost() {
    await this.toggle(this.mayPinPostToggle, true);
  }

  async turnOffMayPinPost() {
    await this.toggle(this.mayPinPostToggle, false);
  }
  
  get isCreateButtonDisable(): Promise<boolean> {
    return this.createButton.hasAttribute('disabled');
  }

  async createTeamButtonShouldBeDisabled() {
    await this.t.expect(this.isCreateButtonDisable).ok();
  }

  async createdTeamButtonShouldBeEnabled() {
    await this.t.expect(this.isCreateButtonDisable).notOk();
  }
}
