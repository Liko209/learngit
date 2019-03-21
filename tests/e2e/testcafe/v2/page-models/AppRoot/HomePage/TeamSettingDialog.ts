import { BaseWebComponent } from "../../BaseWebComponent";

export class TeamSettingDialog extends BaseWebComponent {
  get self() {
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.self.find('h2');
  }

  get exists() {
    return this.title.withText('Settings').exists;
  }

  async shouldBePopup() {
    await this.t.expect(this.exists).ok();
  }

  get avatar() {
    return this.getSelectorByAutomationId('teamAvatar', this.self);
  }

  get teamNameDiv() {
    return this.getSelectorByAutomationId('teamName', this.self);
  }

  get teamNameLabel() {
    return this.teamNameDiv.find('label');
  }

  get teamNameInputArea() {
    return this.teamNameDiv.find('input');
  }

  get teamNameText() {
    return this.teamNameInputArea.value;
  }

  get teamNameInlineError() {
    return this.teamNameDiv.find('p');
  }

  async teamNameShouldBe(name: string) {
    await this.t.expect(this.teamNameText).eql(name);
  }

  async updateTeamName(name: string, options?: TypeActionOptions) {
    await this.t.typeText(this.teamNameInputArea, name, options);
  }

  get descriptionDiv() {
    return this.getSelectorByAutomationId('teamDescription', this.self);
  }

  get descriptionLabel() {
    return this.descriptionDiv.find('label');
  }

  get descriptionArea() {
    return this.descriptionDiv.find('textarea');
  }

  get descriptionText() {
    return this.descriptionArea.textContent;
  }

  async descriptionShouldBe(text: string) {
    await this.t.expect(this.descriptionText).eql(text);
  }

  async updateDescription(text: string, options?) {
    await this.t.typeText(this.descriptionArea, text, options);
  }

  get cancelButton() {
    return this.self.find('button').withText('Cancel');
  }

  async cancel() {
    await this.t.click(this.cancelButton);
  }

  get saveButton() {
    return this.self.find('button').withText('Save');
  }

  async save() {
    await this.t.click(this.saveButton);
  }

  get isSaveDisable(): Promise<boolean> {
    return this.saveButton.hasAttribute('disabled');
  }

  async saveButtonShouldBeEnable() {
    await this.t.expect(this.isSaveDisable).notOk();
  }

  async saveButtonShouldBeDisabled() {
    await this.t.expect(this.isSaveDisable).ok();
  }

  async clearTeamName() {
    await this.t.selectText(this.teamNameInputArea).pressKey('delete');
  }

  checkboxOf(sel: Selector) {
    return sel.find('input[type="checkbox"]');
  }

  private async toggle(checkbox: Selector, check: boolean) {
    const isChecked = await checkbox.checked;
    if (isChecked != check) {
      await this.t.click(checkbox);
    }
  }

  get memberPermissionTitle() {
    return this.getSelectorByAutomationId('memberPermissionTitle');
  }

  get memberPermissionList() {
    return this.getSelectorByAutomationId('memberPermissionList');
  }

  get allowAddTeamMemberToggle() {
    return this.getSelectorByAutomationId('allowAddTeamMemberToggle', this.memberPermissionList);
  }

  get allowAddTeamMemberText() {
    return this.allowAddTeamMemberToggle.parent('li').textContent;
  }

  get allowAddTeamMemberCheckbox() {
    return this.checkboxOf(this.allowAddTeamMemberToggle);
  }

  async allowAddTeamMember() {
    await this.toggle(this.allowAddTeamMemberCheckbox, true);
  }

  async notAllowAddTeamMember() {
    await this.toggle(this.allowAddTeamMemberCheckbox, false);
  }

  get leaveTeamButton() {
    return this.getSelectorByAutomationId('leaveTeamButton', this.self);
  }

  async clickLeaveTeamButton() {
    await this.t.click(this.leaveTeamButton);
  }

  get allowPostMessageToggle() {
    return this.getSelectorByAutomationId('allowPostToggle', this.memberPermissionList);
  }

  get allowPostMessageText() {
    return this.allowPostMessageToggle.parent('li').textContent;
  }

  get allowPostMessageCheckbox() {
    return this.checkboxOf(this.allowPostMessageToggle);
  }

  async allowMemberPostMessage() {
    await this.toggle(this.allowPostMessageCheckbox, true);
  }

  async notAllowMemberPostMessage() {
    await this.toggle(this.allowPostMessageCheckbox, false);
  }

  get allowPinPostToggle() {
    return this.getSelectorByAutomationId('allowPinToggle', this.memberPermissionList);
  }

  get allowPinPostText() {
    return this.allowPinPostToggle.parent('li').textContent;
  }

  get allowPinPostCheckbox() {
    return this.checkboxOf(this.allowPinPostToggle);
  }

  async allowMemberPinPost() {
    await this.toggle(this.allowPinPostCheckbox, true);
  }

  async notAllowMemberPinPost() {
    await this.toggle(this.allowPinPostCheckbox, false);
  }

  get deleteTeamButton() {
    return this.getSelectorByAutomationId("deleteTeamButton");
  }

  get deleteTeamButtonInfoIcon() {
    return this.getSelectorByIcon('info', this.deleteTeamButton);
  }

  async clickDeleteTeamButton() {
    await this.t.click(this.deleteTeamButton);
  }

  get archiveTeamButton() {
    return this.getSelectorByAutomationId("archiveTeamButton");
  }

  get archiveTeamButtonInfoIcon() {
    return this.getSelectorByIcon('info', this.archiveTeamButton);
  }

  async clickArchiveTeamButton() {
    await this.t.click(this.archiveTeamButton);
  }

  /* group only */
  get convertToTeamButton() {
    return this.getSelectorByAutomationId("groupSettingsConvertToTeam", this.self);
  }

  async clickConvertToTeamButton() {
    return this.t.click(this.convertToTeamButton);
  }
}
