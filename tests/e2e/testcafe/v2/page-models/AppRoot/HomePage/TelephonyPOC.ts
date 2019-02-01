import { BaseWebComponent } from "../../BaseWebComponent";

export class TelephonyPOC extends BaseWebComponent {

  get self() {
    return this.getSelectorByAutomationId('leftPanel').nextSibling('div')
  }

  get inputs() {
    return this.self.find("input");
  }
  get extensionInput() {
    return this.inputs.nth(0);
  }

  async typeExtension(text: string){
    await this.t.typeText(this.extensionInput, text);
  }

  get dialButton() {
    return this.button('Dial');
  }

  async clickDial() {
    await this.t.setNativeDialogHandler(() => true).click(this.dialButton);
  }

}