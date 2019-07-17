import { BaseWebComponent } from '../../BaseWebComponent';


export class AboutDialog extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get title() {
    return this.getSelectorByAutomationId('DialogTitle');
  }

  get content() {
    return this.getSelectorByAutomationId("DialogContent", this.self);
  }

  get doneButton() {
    return this.getSelectorByAutomationId("DialogOKButton", this.self);
  }

  async clickDoneButton() {
    await this.t.click(this.doneButton);
  }
}
