import { BaseWebComponent } from "../../BaseWebComponent";

export class Header extends BaseWebComponent {
  get self() {
    return this.getSelector('header');
  }

  getBackNForward(name: string) {
    return this.getComponent(
      BackNForward, 
      this.getSelectorByAutomationId(name, this.self)
    );
  }

  get backButton(){
    return this.getBackNForward('Back');
  }

  get forwardButton(){
    return this.getBackNForward('Forward');
  }
}

export class BackNForward extends BaseWebComponent {
  async click() {
    await this.t.click(this.self);
  }

  get isDisable(): Promise<boolean> {
    return this.self.hasAttribute('disabled');
  }

  async shouldBeDisabled() {
    await this.t.expect(this.isDisable).ok();
  }

  async shouldBeEnabled() {
    await this.t.expect(this.isDisable).notOk();
  }
}