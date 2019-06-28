import { BaseWebComponent } from "../../BaseWebComponent";

export class PostDeleteConfirmDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('deleteConfirmDialog');
  }

  get cancelButton() {
    return this.getSelectorByAutomationId('deleteCancelButton');
  }

  get okButton() {
    return this.getSelectorByAutomationId('deleteOkButton');
  }
}
