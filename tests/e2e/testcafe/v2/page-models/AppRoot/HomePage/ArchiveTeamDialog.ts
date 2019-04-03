import { BaseWebComponent } from '../../BaseWebComponent';

export class ArchiveTeamDialog extends BaseWebComponent {

  get self() {
    return this.getSelectorByAutomationId('archiveTeamConfirmDialog');
  }

  get title() {
    return this.self.find('h2');
  }

  async titleShouldBe(title: string) {
    await this.t.expect(this.title.withExactText(title).exists).ok();
  }

  async shouldBePopup() {
    await this.t.expect(this.exists).ok();
  }

  get confirmation() {
    return this.self.find('p');
  }

  async confirmationShouldBe(text: string) {
    await this.t.expect(this.confirmation.textContent).eql(text);
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('archiveTeamCancelButton');
  }

  async clickCancel() {
    await this.t.click(this.cancelButton);
  }

  get archiveButton() {
    return this.getSelectorByAutomationId('archiveTeamOkButton');
  }

  async clickArchiveButton() {
    await this.t.click(this.archiveButton);
  }

}