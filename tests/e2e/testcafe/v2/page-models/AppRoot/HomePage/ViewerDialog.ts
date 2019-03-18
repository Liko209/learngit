import { BaseWebComponent } from "../../BaseWebComponent";

export class ViewerDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('Viewer').parent('*[role="dialog"]');
  }

  async shouldBePopup() {
    await this.t.expect(this.exists).ok();
  }

  async shouldBeClosed() {
    await this.t.expect(this.exists).notOk();
  }
}
