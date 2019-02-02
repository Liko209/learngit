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
    console.log("click dial button");
    await this.t.setNativeDialogHandler((type, text, url) => {
      console.log(`type ${type}`);
      console.log(text);
      console.log(url);
      return true;
    }).click(this.dialButton);
  }

}