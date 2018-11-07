import { BaseWebComponent } from "../../BaseWebComponent";

export class Header extends BaseWebComponent {
  get self() {
    return this.getSelector('header');
  }

  get backButton() {
    return this.getSelectorByAutomationId('Back', this.self);
  }

  get forwardButton() {
    return this.getSelectorByAutomationId('Forward', this.self);
  }

  async clickBack() {
    await this.t.click(this.backButton);
  }

  async clickForward() {
    await this.t.click(this.forwardButton);
  }
  
}