import { BaseWebComponent } from '../../BaseWebComponent';
import { MemberInput } from './memberInput';

export class AddTeamMembers extends BaseWebComponent {

  get self() {
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.self.find('h2');
  }

  get memberInput() {
    return this.getComponent(MemberInput);
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

}

