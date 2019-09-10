import { BaseWebComponent } from '../../../BaseWebComponent';
import * as assert from 'assert';

export class PhoneSettingPage extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('settingPage-phone');
  }

  get header() {
    return this.getSelectorByAutomationId('settingPageHeader-phone');
  }

  get headerTitle() {
    return this.getSelectorByAutomationId('conversation-page-header-title', this.header);
  }

  get generalSection() {
    return this.getSelectorByAutomationId('settingSection-phoneGeneral');
  }

  get generalLabel() {
    return this.getSelectorByAutomationId(
      'settingSectionTitle-phoneGeneral',
      this.generalSection,
    );
  }

  get defaultAppLabel() {
    return this.getSelectorByAutomationId(
      'settingItemLabel-defaultPhoneApp',
      this.generalSection,
    );
  }

  get defaultAppDescription() {
    return this.getSelectorByAutomationId(
      'settingItemDescription-defaultPhoneApp',
      this.generalSection,
    );
  }

  get defaultAppSelectBox() {
    return this.getSelectorByAutomationId(
      'selectBox-defaultPhoneApp',
      this.generalSection,
    );
  }

  get phoneAppDropDownItems() {
    return this.getSelectorByAutomationClass('selectBoxItem');
  }

  get ringCentralAppItem() {
    return this.getSelectorByAutomationId(
      'selectBoxItem-defaultPhoneApp-glip',
    );
  }

  get ringCentralPhoneItem() {
    return this.getSelectorByAutomationId(
      'selectBoxItem-defaultPhoneApp-ringcentral',
    );
  }

  get changeRCPhoneDialog() {
    return this.getComponent(changeRCPhoneDialog);
  }

  get callIdSetting() {
    return this.getSelectorByAutomationId('settingItem-callerID');
  }

  get callerIDLabel() {
    return this.getSelectorByAutomationId(
      'settingItemLabel-callerID',
      this.generalSection,
    );
  }

  get callerIDDescription() {
    return this.getSelectorByAutomationId(
      'settingItemDescription-callerID',
      this.generalSection,
    );
  }

  get callerIDDropDown() {
    return this.getSelectorByAutomationId('selectBox-callerID', this.generalSection);
  }

  get callerIDDropDownItems() {
    return this.getSelectorByAutomationClass('selectBoxItem');
  }

  get updateRegionDialog() {
    return this.getComponent(UpdateRegionDialog);
  }

  get regionLabel() {
    return this.getSelectorByAutomationId(
      'settingItemLabel-regionSetting',
      this.generalSection,
    );
  }

  get regionDescription() {
    return this.getSelectorByAutomationId(
      'settingItemDescription-regionSetting',
      this.generalSection,
    );
  }

  get regionUpdateButton() {
    return this.getSelectorByAutomationId(
      'settingItemButton-regionSetting',
      this.generalSection,
    );
  }

  get extensionSettingsLabel() {
    return this.getSelectorByAutomationId(
      'settingItemLabel-extensions',
      this.generalSection,
    );
  }

  get extensionSettingsDescription() {
    return this.getSelectorByAutomationId(
      'settingItemDescription-extensions',
      this.generalSection,
    );
  }

  get extensionUpdateButton() {
    return this.getSelectorByAutomationId(
      'settingItemButton-extensions',
      this.generalSection,
    );
  }

  async existsGeneralLabel(text: string) {
    await this.t.expect(this.generalLabel.withText(text).exists).ok();
  }

  // Default App settings
  async existDefaultAppLabel(text: string) {
    await this.t.expect(this.defaultAppLabel.withText(text).exists).ok();
  }

  async existDefaultAppDescription(text: string) {
    await this.t.expect(this.defaultAppDescription.withText(text).exists).ok();
  }

  async existDefaultAppDropDown() {
    await this.t.expect(this.defaultAppSelectBox.exists).ok();
  }

  async clickDefaultAppSelectBox() {
    await this.t.click(this.defaultAppSelectBox);
  }

  async hoverRingCentralPhone() {
    await this.t.hover(this.ringCentralPhoneItem);
  }

  async clickRingCentralPhone() {
    await this.t.click(this.ringCentralPhoneItem);
  }

  async existRingCentralApp() {
    await this.t.expect(this.ringCentralAppItem.exists).ok();
  }

  async existRingCentralPhone() {
    await this.t.expect(this.ringCentralPhoneItem.exists).ok();
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
    await this.t.expect(this.callerIDDropDownItems.count).eql(count);
  }

  async callerIDDropDownItemContains(callerIds: string[]) {
    const count = await this.callerIDDropDownItems.count;
    for (let i = 0; i < count; i++) {
      const text = await this.callerIDDropDownItems.nth(i).innerText;
      const numberOnly = text.replace(/[^\d]/g, '');
      const reg = new RegExp(`${numberOnly}$`);
      let result = false;
      for (const i in callerIds) {
        if (reg.test(callerIds[i])) {
          result = true;
        }
      }
      assert.ok(result, `${text} does not apply ${callerIds}`);
    }
  }

  async selectCallerID(text: string) {
    await this.t.click(this.callerIDDropDownItems.withText(text));
  }

  async selectCallerIdByText(text: string) {
    await this.t.click(this.callerIDDropDownItems.withText(text));
  }

  async clickCallerIDDropDown() {
    await this.t.click(this.callerIDDropDown);
  }

  async getCallerIDList() {
    let callerIDList = [];
    const count = await this.callerIDDropDownItems.count;
    for (let i = 0; i < count; i++) {
      let item = await this.callerIDDropDownItems.nth(i).innerText;
      callerIDList.push(item);
    }
    return callerIDList;
  }

  /** emergency address */
  get emergencyAddressSettingLabel() {
    return this.getSelectorByAutomationId('settingItemLabel-E911Setting');
  }

  get emergencyAddressSettingDescription() {
    return this.getSelectorByAutomationId('settingItemDescription-E911Setting');
  }

  get emergencyAddressSettingEditButton() {
    return this.getSelectorByAutomationId('settingItemButton-e911Setting');
  }

  async clickEmergencyAddressSettingEditButton() {
    await this.t.click(this.emergencyAddressSettingEditButton);
  }

  // Extension setting
  async existExtensionSettingsLabel(text: string) {
    await this.t.expect(this.extensionSettingsLabel.withText(text).exists).ok();
  }

  async existExtensionSettingsDescription(text: string) {
    await this.t
      .expect(this.extensionSettingsDescription.withText(text).exists)
      .ok();
  }

  async existExtensionUpdateButton() {
    await this.t.expect(this.extensionUpdateButton.exists).ok();
  }
}

export class UpdateRegionDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('dialog-regionSetting');
  }

  get exists() {
    return this.title.exists;
  }

  get title() {
    return this.getSelectorByAutomationId('dialog-header-regionSetting');
  }

  get statement() {
    return this.getSelectorByAutomationId(
      'dialog-contentDescription-regionSetting',
    );
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
    return this.getSelectorByAutomationId(
      'dialog-regionSetting-areaCodeTextField',
    );
  }

  get areaCodeInput() {
    return this.getSelectorByAutomationId('dialog-regionSetting-areaCodeInput');
  }

  get areaCodeLabel() {
    return this.areaCode.find('label');
  }

  get invalidAreaCodeLabel() {
    return this.areaCode.find('p');
  }

  get saveButton() {
    return this.getSelectorByAutomationId('dialog-okButton-regionSetting');
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('dialog-cancelButton-regionSetting');
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
    await this.t
      .click(this.areaCodeInput)
      .selectText(this.areaCodeInput)
      .pressKey('delete');
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
export class changeRCPhoneDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('defaultPhoneAppConfirmDialog');
  }

  get exists() {
    return this.title.exists;
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle');
  }

  get statement() {
    return this.getSelectorByAutomationId('DialogContent');
  }

  get okButton() {
    return this.getSelectorByAutomationId('defaultPhoneAppOkButton');
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('defaultPhoneAppCancelButton');
  }

  async titleShouldBe(text: string) {
    await this.t.expect(this.title.withText(text).exists).ok();
  }

  async statementShouldBe(text: string) {
    await this.t.expect(this.statement.withText(text).exists).ok();
  }

  async okButtonShouldBeText(text: string) {
    await this.t.expect(this.okButton.withText(text).exists).ok();
  }

  async cancelButtonShouldBeText(text: string) {
    await this.t.expect(this.cancelButton.withText(text).exists).ok();
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickOKButton() {
    await this.t.click(this.okButton);
  }
}
