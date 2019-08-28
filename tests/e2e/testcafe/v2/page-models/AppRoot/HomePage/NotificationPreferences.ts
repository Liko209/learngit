import { BaseWebComponent } from "../../BaseWebComponent";

export class NotificationPreferencesDialog extends BaseWebComponent {
  get self() {
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle');
  }

  get content() {
    return this.getSelectorByAutomationId('DialogContent');
  }

  get muteAll() {
    return this.getSelectorByAutomationId('settingItem-muteAll');
  }

  get muteAllLabel() {
    return this.getSelectorByAutomationId(' settingItemLabel-muteAll');
  }

  get muteAllCheckbox() {
    return this.getSelectorByAutomationId('muted-checkbox').find('input[type="checkbox"]');
  }

  get desktopNotification() {
    return this.getSelectorByAutomationId('settingItem-desktopNotifications');
  }

  get desktopNotificationLabel() {
    return this.getSelectorByAutomationId('settingItemLabel-desktopNotifications');
  }

  get desktopNotificationCheckbox() {
    return this.getSelectorByAutomationId('desktopNotifications-checkbox').find('input[type="checkbox"]');
  }

  get soundNotification() {
    return this.getSelectorByAutomationId('settingItem-audioNotifications');
  }

  get soundNotificationLabel() {
    return this.getSelectorByAutomationId('settingItemLabel-audioNotifications');
  }

  get soundNotificationSelectBox() {
    return this.getSelectorByAutomationId('selectBox-audioNotifications')
  }

  get mobileNotification() {
    return this.getSelectorByAutomationId('settingItem-pushNotifications');
  }

  get mobileNotificationLabel() {
    return this.getSelectorByAutomationId('settingItemLabel-pushNotifications');
  }

  get mobileNotificationSelectBox() {
    return this.getSelectorByAutomationId('selectBox-pushNotifications');
  }

  get emailNotification() {
    return this.getSelectorByAutomationId('settingItem-emailNotifications');
  }

  get emailNotificationLabel() {
    return this.getSelectorByAutomationId('settingItemLabel-emailNotifications');
  }

  get emailNotificationSelectBox() {
    return this.getSelectorByAutomationId('selectBox-emailNotifications');
  }

  /** selectBoxItem */
  get selectBoxItems() {
    return this.getSelectorByAutomationClass('selectBoxItem');
  }

  selectBoxItemByText(text: string) {
    return this.selectBoxItems.withExactText(text);
  }

  selectBoxItemByValue(value: string) {
    return this.selectBoxItems.withAttribute('data-test-automation-value', value);
  }

  get cancelButton() {
    return this.getSelectorByAutomationIdUnderSelf('DialogCancelButton');
  }

  get saveButton() {
    return this.getSelectorByAutomationIdUnderSelf('DialogOKButton');
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

  /** actions */
  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickSaveButton() {
    await this.t.click(this.saveButton);
  }

  async clickMuteAllCheckBox() {
    await this.t.click(this.muteAllCheckbox);
  }

  async clickDesktopNotificationCheckBox() {
    await this.t.click(this.desktopNotificationCheckbox);
  }

  async clickSoundNotificationSelectBox() {
    await this.t.click(this.soundNotificationSelectBox);
  }

  async clickMobileNotificationSelectBox() {
    await this.t.click(this.mobileNotificationSelectBox);
  }

  async clickEmailNotificationSelectBox() {
    await this.t.click(this.emailNotificationSelectBox);
  }

  async clickSelectBoxItemByValue(value: string) {
    await this.t.click(this.selectBoxItemByValue(value));
  }

  async clickSelectBoxItemByNth(n: number) {
    await this.t.click(this.selectBoxItems.nth(n));
  }

  async clickSelectBoxItemByText(text: string) {
    await this.t.click(this.selectBoxItemByText(text));
  }

  private async toggleCheckBox(checkbox: Selector, checked: boolean) {
    const isChecked = await checkbox.checked;
    if (isChecked != checked) {
      await this.t.click(checkbox);
    }
  }

  async checkMuteAll() {
    await this.toggleCheckBox(this.muteAllCheckbox, true);
  }

  async uncheckMuteAll() {
    await this.toggleCheckBox(this.muteAllCheckbox, false);
  }

  async checkDesktopNotification() {
    await this.toggleCheckBox(this.desktopNotificationCheckbox, true);
  }

  async uncheckDesktopNotification() {
    await this.toggleCheckBox(this.desktopNotificationCheckbox, false);
  }

  /** expects */
  async expectDesktopNotificationEnabled() {
    await this.t.expect(this.desktopNotification.getAttribute('data-disabled')).eql('false');
  }

  async expectDesktopNotificationDisabled() {
    await this.t.expect(this.desktopNotification.getAttribute('data-disabled')).eql('true');
  }

  async expectSoundNotificationEnabled() {
    await this.t.expect(this.soundNotification.getAttribute('data-disabled')).eql('false');

  }

  async expectSoundNotificationDisabled() {
    await this.t.expect(this.soundNotification.getAttribute('data-disabled')).eql('true');
  }

  async expectSoundNotificationSelectBoxValue(value: string) {
    await this.t.expect(this.soundNotificationSelectBox.getAttribute('data-test-automation-value')).eql(value);
  }

  async expectSoundNotificationSelectBoxText(text: string) {
    await this.t.expect(this.soundNotificationSelectBox.textContent).eql(text);
  }

  async expectMobileNotificationEnabled() {
    await this.t.expect(this.mobileNotification.getAttribute('data-disabled')).eql('false');
  }

  async expectMobileNotificationDisabled() {
    await this.t.expect(this.mobileNotification.getAttribute('data-disabled')).eql('true');
  }

  async expectMobileNotificationSelectBoxValue(value: string) {
    await this.t.expect(this.mobileNotificationSelectBox.getAttribute('data-test-automation-value')).eql(value);
  }

  async expectMobileNotificationSelectBoxText(text: string) {
    await this.t.expect(this.mobileNotificationSelectBox.textContent).eql(text);
  }

  async expectEmailNotificationEnabled() {
    await this.t.expect(this.emailNotification.getAttribute('data-disabled')).eql('false');
  }

  async expectEmailNotificationDisabled() {
    await this.t.expect(this.emailNotification.getAttribute('data-disabled')).eql('true');
  }

  async expectEmailNotificationSelectBoxValue(value: string) {
    await this.t.expect(this.emailNotificationSelectBox.getAttribute('data-test-automation-value')).eql(value);
  }

  async expectEmailNotificationSelectBoxText(text: string) {
    await this.t.expect(this.emailNotificationSelectBox.textContent).eql(text);
  }

}
