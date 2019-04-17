import { BaseWebComponent } from '../../BaseWebComponent';

export class LogoutDialog extends BaseWebComponent {

  get self() {
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.self.find('h2');
  }

  get exists() {
    this.warnFlakySelector();
    return this.title.withText('Log out?').exists;
  }

  get confirmation() {
    return this.self.find('p');
  }

  async ConfirmationTextShouldBe(text: string) {
    await this.t.expect(this.confirmation.textContent).eql(text);
  }

  get cancelButton() {
    this.warnFlakySelector();
    return this.buttonOfText('Cancel');
  }

  async cancel() {
    await this.t.click(this.cancelButton);
  }

  get LogoutButton() {
    this.warnFlakySelector();
    return this.buttonOfText('Log out');
  }

  async leave() {
    await this.t.click(this.LogoutButton);
  }

}