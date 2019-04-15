import { BaseWebComponent } from '../../BaseWebComponent';

export class LeaveTeamDialog extends BaseWebComponent {

  get self() {
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.self.find('h2');
  }

  get exists() {
    return this.title.withText('Leave team').exists;
  }

  async shouldBePopup() {
    await this.t.expect(this.exists).ok();
  }

  get confirmation() {
    return this.self.find('p');
  }

  async teamNameInConfirmationShouldBe(teamName: string) {
    const text = `Once you leave ${teamName}, you will no longer have access to the content.`;
    await this.t.expect(this.confirmation.textContent).eql(text);
  }

  get cancelButton() {
    return this.buttonOfText('Cancel');
  }

  async cancel() {
    await this.t.click(this.cancelButton);
  }

  get LeaveButton() {
    return this.buttonOfText('Leave');
  }

  async leave() {
    await this.t.click(this.LeaveButton);
  }

}