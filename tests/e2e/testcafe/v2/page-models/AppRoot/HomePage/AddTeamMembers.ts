import { BaseWebComponent } from '../../BaseWebComponent';
import { searchComoBox } from './SearchComboBox';

export class AddTeamMembers extends BaseWebComponent {

  get self() {
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.self.find('h2').withText('Add Team Members');
  }

  get memberInput() {
    return this.getComponent(searchComoBox, this.self.find('*[role="combobox"]'));
  }

  get addButton() {
    return this.self.find('button').withText('Add');
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
    return this.self.find('button').withText('Cancel');
  }

  async add() {
    await this.t.click(this.addButton);
  }

  async cancel() {
    await this.t.click(this.cancelButton);
  }

  async shouldBePopup() {
    await this.t.expect(this.self.exists).ok();
  }


}

