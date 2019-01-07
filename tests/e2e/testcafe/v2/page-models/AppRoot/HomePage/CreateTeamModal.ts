/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-01 15:21:39
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseWebComponent } from '../../BaseWebComponent';
import * as _ from 'lodash';

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
    this.warnFlakySelector();
    return this.self.find('button').nth(1);
  }

  get toggleList() {
    return this.getSelectorByAutomationId("CreateTeamToggleList");
  }

  get teamNameInput() {
    return this.getSelectorByAutomationId("CreateTeamName");
  }

  get teamDescriptionInput() {
    return this.getSelectorByAutomationId("CreateTeamDescription");
  }

  private getToggleButton(index) {
    return this.toggleList.find('input').nth(index);
  }

  async clickPublicTeamButton() {
    await this.t.click(this.getToggleButton(0));
  }

  async clickMayPostButton() {
    await this.t.click(this.getToggleButton(1));
  }

  async setTeamName(teamName) {
    await this.t.typeText(this.teamNameInput, `${teamName}`, {
      replace: true,
    });
  }

  randomString(length: number) {
    return Array(length).fill(1).join('');
  }

  async inputRandomTeamName(length: number) {
    await this.t.typeText(this.teamNameInput, this.randomString(length), { replace: true, paste: false })
  }

  async inputRandomTeamDescription(length: number) {
    await this.t.typeText(this.teamDescriptionInput, this.randomString(length), { replace: true, paste: false })
  }

  // deprecated
  async inputTeamNameMax() {
    const name = [];
    for (let i = 0; i < 202; i++) {
      name.push(1);
    }
    await this.t.typeText(this.teamNameInput, name.join(''));
  }

  // deprecated
  async inputDescriptionNameMax() {
    const name = [];
    for (let i = 0; i < 1002; i++) {
      name.push(1);
    }
    await this.t.typeText(this.teamDescriptionInput, name.join(''));
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickCreateButton() {
    await this.t.click(this.createButton);
  }

  get membersInput() {
    return this.self.find('#downshift-multiple-input');
  }

  async typeMember(text: string, options?) {
    await this.t.typeText(this.membersInput, text, options)
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


  async click() {
    await this.t.click(this.self);
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