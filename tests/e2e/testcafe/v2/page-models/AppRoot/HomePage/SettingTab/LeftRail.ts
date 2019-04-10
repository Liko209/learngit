import { BaseWebComponent } from "../../../BaseWebComponent";

export class LeftRail extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('entry-general').parent('div');
  }

}
