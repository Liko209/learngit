import { BaseWebComponent } from '../../BaseWebComponent';

export class DeleteTeamDialog extends BaseWebComponent {

  get self() {
    return this.getSelectorByAutomationId('deleteTeamConfirmDialog');
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle');
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
    const text = `Are you sure you want to permanently delete ${teamName} team?`;
    await this.t.expect(this.confirmation.textContent).eql(text);
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('deleteTeamCancelButton');
  }

  async clickCancel() {
    await this.t.click(this.cancelButton);
  }

  get DeleteButton() {
    return this.getSelectorByAutomationId('deleteTeamOkButton');
  }

  async clickDeleteButton() {
    await this.t.click(this.DeleteButton);
  }

}
