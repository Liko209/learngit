import { BaseWebComponent } from '../../BaseWebComponent';
import { SearchComoBox } from './SearchComboBox';

export class AddTeamMembers extends BaseWebComponent {

  get self() {
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle');
  }

  get memberInput() {
    return this.getComponent(SearchComoBox, this.self.find('*[role="combobox"]'));
  }

  get inputArea() {
    return this.memberInput.self.find('input')
  }

  get addButton() {
    return this.getSelectorByAutomationIdUnderSelf('DialogOKButton');
  }

  get isAddButtonDisabled(): Promise<boolean> {
    return this.addButton.hasAttribute('disabled');
  }

  async addButtonShouldBeDisabled() {
    await this.t.expect(this.isAddButtonDisabled).ok();
  }

  async addButtonShouldBeEnabled() {
    await this.t.expect(this.isAddButtonDisabled).notOk();
  }

  get cancelButton() {
    return this.getSelectorByAutomationIdUnderSelf('DialogCancelButton');
  }

  async clickAddButton() {
    await this.t.click(this.addButton);
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

}

