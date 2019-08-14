import * as assert from 'assert';
import { BaseWebComponent } from '../../BaseWebComponent';
import { ClientFunction } from 'testcafe';
import * as faker from 'faker/locale/en';

export class AddressConfirmDialog extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle');
  }

  get dialogContent() {
    return this.getSelectorByAutomationId("DialogContent", this.self)
  }

  get dialogOKButton() {
    return this.getSelectorByAutomationId("DialogOKButton", this.self)
  }

  async clickConfirmAddressButton() {
    await this.t.click(this.dialogOKButton);
  }

  get customerName() {
    return this.getSelectorByAutomationId('e911-customerName');
  }

  get countrySelect() {
    return this.getSelectorByAutomationId('e911-country-select');
  }

  getCountryItem(country: string) {
    return this.getSelectorByAutomationId(`country-${country}`);
  }

  get streetAddress() {
    return this.getSelectorByAutomationId('e911-streetAddress');
  }

  get additionalAddress() {
    return this.getSelectorByAutomationId('e911-additionalAddress');
  }

  get city() {
    return this.getSelectorByAutomationId('e911-city');
  }

  get stateSelect() {
    return this.getSelectorByAutomationId('e911-state-select');
  }

  getStateItem(state: string) {
    return this.getSelectorByAutomationId(`country-${state}`);
  }

  get zipCode() {
    return this.getSelectorByAutomationId('e911-zipCode');
  }

  get cancelButton() {
    return this.getSelectorByAutomationIdUnderSelf('e911-DialogCancelButton')
  }

  get confirmButton() {
    return this.getSelectorByAutomationIdUnderSelf('e911-DialogOKButton')
  }

  // todo
  get outOfRegionDiv() {
    return this.getSelectorByAutomationId('');
  }


  /** actions  */
  async clickSelectCountry() {
    await this.t.click(this.countrySelect.find('input'))
  }

  async selectCountry(country: string) {
    await this.t.click(this.getCountryItem(country));
  }

  async clickSelectState() {
    await this.t.click(this.stateSelect.find('input'))
  }

  async selectState(state: string) {
    await this.t.click(this.getStateItem(state));
  }

  async checkAllDisclaimerCheckBox() {
    const checkbox = this.self.find('input[type="checkbox"]');
    const count = await checkbox.count
    for (let i = 0; i < count; i++) {
      await this.t.click(checkbox.nth(i));
    }
  }

  async typeRandomTextInEveryField() {
    await this.t.typeText(this.customerName, faker.name.findName(), { replace: true, paste: true });
    await this.t.typeText(this.streetAddress, faker.address.streetAddress(), { replace: true, paste: true });
    await this.t.typeText(this.additionalAddress, faker.address.secondaryAddress(), { replace: true, paste: true });
    await this.t.typeText(this.city, faker.address.city(), { replace: true, paste: true });
    await this.t.typeText(this.zipCode, faker.address.zipCode(), { replace: true, paste: true });
  }

  async  clickCancelButton() {
    await this.t.click(this.cancelButton)
  }

  async  clickConfirmButton() {
    await this.t.click(this.confirmButton)
  }

  /** assertions */
  async expectConfirmButtonDisabled() {
    await this.t.expect(this.confirmButton.hasAttribute('disabled')).ok();
  }

  async expectConfirmButtonEnabled() {
    await this.t.expect(this.confirmButton.hasAttribute('disabled')).notOk();
  }
}


export class EmergencyConfirmDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('emergencyConfirmDialog');
  }

  get title() {
    this.warnFlakySelector();
    return this.self.find('h2');
  }

  get closeButton() {
    return this.getSelectorByAutomationIdUnderSelf('emergencyConfirmDialogCrossButton');
  }

  get dialogContent() {
    return this.getSelectorByAutomationIdUnderSelf("DialogContent");
  }

  get emergencyConfirmOkButton() {
    return this.getSelectorByAutomationIdUnderSelf('emergencyConfirmDialogOkButton');
  }

  get emergencyConfirmCancelButton() {
    return this.getSelectorByAutomationIdUnderSelf('emergencyConfirmDialogCancelButton');
  }

  /** actions */
  async clickCloseButton() {
    await this.t.click(this.closeButton);
  }

  async clickEmergencyConfirmOkButton() {
    await this.t.click(this.emergencyConfirmOkButton);
  }

  async clickEmergencyConfirmCancelButton() {
    await this.t.click(this.emergencyConfirmCancelButton);
  }
}
