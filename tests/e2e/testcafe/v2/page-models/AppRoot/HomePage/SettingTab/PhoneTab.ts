import { BaseWebComponent } from '../../../BaseWebComponent';
export class PhoneTab extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('SettingContainer');
  };

  get generalLabel() {
    return this.getSelectorByAutomationId('SettingSectionHeader').find('.setting-section-title');
  }

  get callerIDLabel() {
    return this.getSelectorByAutomationId('SettingSectionItemLabel-callerID');
  }

  get callerIDDescription() {
    return this.getSelectorByAutomationId('SettingSectionItemDescription-callerID');
  }

  get callerIDDropDown() {
    return this.getSelectorByAutomationId('SettingSelectBox');
  }

  get callerIDDropDownItem() {
    return this.getSelectorByAutomationId('SettingSelectItem');
  }

  get updateRegionDialog() {
    return this.getComponent(UpdateRegionDialog);
  }

  get regionLabel() {
    return this.getSelectorByAutomationId('SettingSectionItemLabel-regionSetting');
  }

  get regionDescription() {
    return this.getSelectorByAutomationId('SettingSectionItemDescription-regionSetting');
  }

  get regionUpdateButton() {
    return this.getSelectorByAutomationId('regionSettingDialogOpenButton');
  }

  get extensionSettingsLabel() {
    return this.getSelectorByAutomationId('SettingSectionItemLabel-extensions');
  }

  get extensionSettingsDescription() {
    return this.getSelectorByAutomationId('SettingSectionItemDescription-extensions');
  }

  get extensionUpdateButton() {
    return this.getSelectorByAutomationId('settingPhoneGeneralExtensionSetting');
  }

  async existsGeneralLabel(text: string) {
    await this.t.expect(this.generalLabel.withText(text).exists).ok();
  }

  // Region settings
  async clickRegionUpdateButton() {
    await this.t.click(this.regionUpdateButton);
  }

  async regionDescriptionWithText(text: string) {
    await this.t.expect(this.regionDescription.withText(text).exists).ok();
  }

  async existRegionLabel(text: string) {
    await this.t.expect(this.regionLabel.withText(text).exists).ok();
  }

  // Caller id settings
  async existCallerIDLabel(text: string) {
    await this.t.expect(this.callerIDLabel.withText(text).exists).ok();
  }

  async existCallerIDDescription(text: string) {
    await this.t.expect(this.callerIDDescription.withText(text).exists).ok();
  }

  async existCallerIDDropDown() {
    await this.t.expect(this.callerIDDropDown.exists).ok();
  }

  async checkCallerIDItemCount(count: number) {
    await this.t.expect(this.callerIDDropDownItem.count).eql(count);
  }

  async callerIDDropDownItemWithText(text: string) {
    const value = await this.callerIDDropDownItem.innerText;
    text = value.replace('/\(|\)/g', '');
    await this.t.expect(this.callerIDDropDownItem.withText(text).exists).ok();
  }

  async selectCallerID(text: string) {
    await this.t.click(this.callerIDDropDownItem.withText(text));
  }

  async clickCallerIDDropDown() {
    await this.t.click(this.callerIDDropDown);
  }

  async getCallerIDList() {
    let callerIDList = [];
    const count = await this.callerIDDropDownItem.count;
    for (let i = 0; i < count; i++) {
      let item = await this.callerIDDropDownItem.nth(i).innerText
      callerIDList.push(item);
    }
    return callerIDList;
  }


  // Extension setting
  async existExtensionSettingsLabel(text: string) {
    await this.t.expect(this.extensionSettingsLabel.withText(text).exists).ok();
  }

  async existExtensionSettingsDescription(text: string) {
    await this.t.expect(this.extensionSettingsDescription.withText(text).exists).ok();
  }

  async existExtensionUpdateButton() {
    await this.t.expect(this.extensionUpdateButton.exists).ok();
  }
}

export class UpdateRegionDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('regionSettingDialogHeader');
  }

  get title() {
    return this.getSelectorByAutomationId('regionSettingDialogHeader');
  }

  get statement() {
    return this.getSelectorByAutomationId('regionSettingDialogContentDescription');
  }

  get countryDropDown() {
    return this.getSelectorByAutomationId('regionSettingDialPlanSelect');
  }

  get countryDropDownList() {
    return this.getSelectorByAutomationId('regionSettingDialPlanSelectItem');
  }

  get countryLabel() {
    return this.countryDropDown.find('label');
  }

  get areaCode() {
    return this.getSelectorByAutomationId('areaCodeTextField');
  }

  get areaCodeInput() {
    return this.getSelectorByAutomationId('areaCodeInput');
  }

  get areaCodeLabel() {
    return this.areaCode.find('label');
  }

  get invalidAreaCodeLabel() {
    return this.areaCode.find('p');
  }

  get saveButton() {
    return this.getSelectorByAutomationId('saveRegionSettingOkButton');
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('saveRegionSettingCancelButton');
  }

  async showUpdateRegionDialog() {
    await this.t.expect(this.self.exists).ok();
  }

  async noUpdateRegionDialog() {
    await this.t.expect(this.self.exists).notOk();
  }

  async clickSaveButton() {
    await this.t.click(this.saveButton);
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async showAreaCode() {
    await this.t.expect(this.areaCode.exists).ok();
  }

  async existAreaCodeLabel(text: string) {
    await this.t.expect(this.areaCodeLabel.withText(text).exists).ok();
  }

  async noAreaCode() {
    await this.t.expect(this.areaCode.exists).notOk();
  }

  async setAreaCode(text: string) {
    await this.t.typeText(this.areaCode, text);
  }

  async clearInputByKey() {
    await this.t.click(this.areaCodeInput).selectText(this.areaCodeInput).pressKey('delete');
  }

  async showAreaCodeWithText(text: string) {
    await this.t.expect(this.areaCodeInput.value).eql(text);
  }

  async existInvalidAreaCodeLabel(text: string) {
    await this.t.expect(this.invalidAreaCodeLabel.withText(text).exists).ok();
  }

  async showCountryDropDown() {
    await this.t.expect(this.countryDropDown.exists).ok();
  }

  async clickCountryDropDown() {
    await this.t.click(this.countryDropDown);
  }

  async selectCountryWithText(text: string) {
    await this.t.click(this.countryDropDownList.withText(text));
  }

  async showCountrySelectedWithText(text: string) {
    await this.t.expect(this.countryDropDown.withText(text).exists).ok();
  }

  async checkTitle(text: string) {
    await this.t.expect(this.title.withText(text).exists).ok();
  }

  async checkStatement(text: string) {
    await this.t.expect(this.statement.withText(text).exists).ok();
  }

  async existCountryLabel(text: string) {
    await this.t.expect(this.countryLabel.withText(text).exists).ok();
  }

  async checkSaveButton(text: string) {
    await this.t.expect(this.saveButton.withText(text).exists).ok();
  }

  async checkCancelButton(text: string) {
    await this.t.expect(this.cancelButton.withText(text).exists).ok();
  }
}