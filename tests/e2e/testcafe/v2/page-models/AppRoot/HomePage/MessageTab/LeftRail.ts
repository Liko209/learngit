import { BaseWebComponent } from "../../../BaseWebComponent";
import { ClientFunction } from "testcafe";

export class LeftRail extends BaseWebComponent {

  get self() {
    return this.getSelectorByAutomationId('leftRail');
  }

  get scrollDiv() {
    return this.self.child('div').nth(1);
  }

  async scrollToY(y: number) {
    const scrollDivElement = this.scrollDiv;
    await ClientFunction((_y) => {
      scrollDivElement().scrollTop = _y;
    },
      { dependencies: { scrollDivElement } })(y);
  }
}
