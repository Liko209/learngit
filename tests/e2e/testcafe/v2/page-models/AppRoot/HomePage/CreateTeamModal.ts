/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-01 15:21:39
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseWebComponent } from '../../BaseWebComponent';
import * as _ from 'lodash';
import * as faker from 'faker/locale/en';
import { SearchComoBox } from './SearchComboBox';


// TODO: unify create team, convert to team, team setting automation ID
class BaseTeamSetting extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle');
  }

  get teamNameInput() {
    return this.getSelectorByAutomationId("CreateTeamName");
  }

  get teamNameInlineError() {
    return this.self.find('#Team name-helper-text');
  }

  get toggleList() {
    return this.getSelectorByAutomationId("CreateTeamToggleList");
  }
  get teamDescriptionInput() {
    return this.getSelectorByAutomationId("CreateTeamDescription");
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

  get mayAtTeamMentionDiv() {
    return this.getSelectorByAutomationId('CreateTeamCanAtTeamMention').parent('li');
  }
  get mayPinPostDiv() {
    return this.getSelectorByAutomationId('CreateTeamCanPinPost').parent('li');
  }

  async typeTeamName(teamName: string, options: TypeActionOptions = { replace: true }) {
    await this.clickAndTypeText(this.teamNameInput, teamName, options);
  }

  randomString(length: number) {
    return faker.random.alphaNumeric(length);
  }

  async typeRandomTeamName(length: number, options: TypeActionOptions = { replace: true }) {
    await this.typeTeamName(this.randomString(length), options);
  }

  async typeRandomTeamDescription(length: number) {
    await this.clickAndTypeText(this.teamDescriptionInput, this.randomString(length), { replace: true, })
  }

  async typeTeamDescription(text: string) {
    await this.clickAndTypeText(this.teamDescriptionInput, text, { replace: true });
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
  get mayAtTeamMentionToggle() {
    return this.checkboxOf(this.mayAtTeamMentionDiv)
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
  async turnOnAtTeamMentionToggle() {
    await this.toggle(this.mayAtTeamMentionToggle, true);
  }

  async turnOffAtTeamMentionToggle() {
    await this.toggle(this.mayAtTeamMentionToggle, false);
  }
}


export class CreateTeamModal extends BaseTeamSetting {
  get exists() {
    return this.title.withExactText('Create team').exists
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('createToTeamCancelButton', this.self);
  }

  get createButton() {
    return this.getSelectorByAutomationId('createTeamOkButton', this.self);
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickCreateButton() {
    await this.t.expect(this.createButton.hasAttribute('disabled')).notOk().click(this.createButton);
    await this.waitForAllSpinnersToDisappear();
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

  get memberInput() {
    return this.getComponent(SearchComoBox, this.self.find('*[role="combobox"]'));
  }
}

export class ConvertToTeamDialog extends BaseTeamSetting {
  get exists() {
    return this.title.withExactText('Convert to team').exists
  }

  get teamNameInput() {
    return this.getSelectorByAutomationId("ConvertToTeamTeamName");
  }

  get teamDescriptionInput() {
    return this.getSelectorByAutomationId("ConvertToTeamTeamDescription");
  }

  get toggleList() {
    return this.getSelectorByAutomationId("ConvertToTeamToggleList");
  }

  get isPublicDiv() {
    return this.getSelectorByAutomationId('ConvertToTeamIsPublic').parent('li');
  }

  get mayAddMemberDiv() {
    return this.getSelectorByAutomationId('ConvertToTeamCanAddMember').parent('li');
  }

  get mayPostMessageDiv() {
    return this.getSelectorByAutomationId('ConvertToTeamCanPost').parent('li');
  }

  get mayPinPostDiv() {
    return this.getSelectorByAutomationId('ConvertToTeamCanPinPost').parent('li');
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('convertToTeamCancelButton', this.self);
  }

  get convertToTeamButton() {
    return this.getSelectorByAutomationId('convertToTeamOkButton', this.self);
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickConvertToTeamButton() {
    await this.t.expect(this.convertToTeamButton.hasAttribute('disabled')).notOk().click(this.convertToTeamButton);
    await this.waitForAllSpinnersToDisappear();
  }

  get isConvertToTeamButtonDisable(): Promise<boolean> {
    return this.convertToTeamButton.hasAttribute('disabled');
  }

  async convertToTeamButtonShouldBeDisabled() {
    await this.t.expect(this.isConvertToTeamButtonDisable).ok();
  }

  async convertToTeamButtonShouldBeEnabled() {
    await this.t.expect(this.isConvertToTeamButtonDisable).notOk();
  }

}
