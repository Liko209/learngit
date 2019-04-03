import { getLogger } from 'log4js';
import { BaseWebComponent } from "../../BaseWebComponent";

const logger = getLogger(__filename);
logger.level = 'info';
export class TelephonyPOC extends BaseWebComponent {

  get self() {
    logger.warn(`This page model is deprecated.`);
    return this.getSelectorByAutomationId('leftPanel').nextSibling('div');
  }

  get inputs() {
    return this.self.find("input");
  }
  get extensionInput() {
    return this.inputs.nth(0);
  }

  async typeExtension(text: string) {
    await this.t.typeText(this.extensionInput, text);
  }

  get dialButton() {
    return this.button('Dial');
  }

  get endButton() {
    return this.button('End');
  }

  async clickDial() {
    await this.t.click(this.dialButton);
  }

  async clickEnd() {
    await this.t.click(this.endButton);
  }

}