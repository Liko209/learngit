import { BaseWebComponent } from "../../../BaseWebComponent";

export class PhonePage extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId("SettingContainer");
  }

  get header() {
    return this.getSelectorByAutomationId("conversation-page-header-title");
  }

  get generalSection() {
    return this.getSelectorByAutomationId("SettingPageHeader");

  }
}
