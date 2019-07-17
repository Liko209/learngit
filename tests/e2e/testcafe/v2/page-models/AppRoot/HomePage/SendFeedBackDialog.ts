import { BaseWebComponent } from '../../BaseWebComponent';

export class SendFeedBackDialog extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle');
  }

  get content() {
    return this.getSelectorByAutomationId("DialogContent", this.self)
  }

  get cancelButton() {
    this.warnFlakySelector();
    return this.getSelectorByAutomationId('DialogCancelButton');
  }

  get sendButton() {
    this.warnFlakySelector();
    return this.getSelectorByAutomationId('DialogOKButton');
  }

  get summaryTextarea() {
    return this.content.find('#Summary');
  }

  get describeTextarea() {
    return this.content.find('#Describe');
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickSendButton() {
    await this.t.click(this.sendButton);
  }

  async summaryInput(message: string) {
    await this.clickAndTypeText(this.summaryTextarea, `${message}`, { replace: true, paste: true });
  }

  async descriptionInput(message: string) {
    await this.clickAndTypeText(this.describeTextarea, message, { replace: true });
  }

}
