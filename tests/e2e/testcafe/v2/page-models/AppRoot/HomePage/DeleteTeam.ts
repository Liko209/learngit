import { BaseWebComponent } from '../../BaseWebComponent';

export class LeaveTeamDialog extends BaseWebComponent {

  get self() {
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.self.find('h2');
  }

  get exists() {
    return this.title.withText('Delete Team?').exists;
  }

  async shouldBePopup() {
    await this.t.expect(this.exists).ok();
  }

  get confirmation() {
    return this.self.find('p');
  }

  async teamNameInConfirmationShouldBe(teamName: string) {
    const text = `Are you sure you want to permanently delete ${teamName}?`;
    await this.t.expect(this.confirmation.textContent).eql(text);
  }

  get cancelButton() {
    return this.button('Cancel');
  }

  async clickCancel() {
    await this.t.click(this.cancelButton);
  }

  get DeleteButton() {
    return this.button('Delete');
  }

  async clickDeleteButton() {
    await this.t.click(this.DeleteButton);
  }

}