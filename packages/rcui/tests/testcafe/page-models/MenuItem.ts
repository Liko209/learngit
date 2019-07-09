import { BaseWebComponent } from "./BaseWebComponent";
import { MenuRoot } from "./MenuRoot";

export class MenuItem extends BaseWebComponent {

  constructor(protected t: TestController, readonly parent: BaseWebComponent, readonly index: number) {
    super(t);
  }

  get self() {
    return this.parent.self.child('a').nth(this.index);
  }

  async childElementHasShown() {
    const next = this.self.nextSibling(0);
    if (await next.exists && await next.tagName == 'div') {
      return true;
    } else {
      return false;
    }
  }

  isChildOfMenuRoot() {
    return this.parent instanceof MenuRoot;
  }

  async isLeafItem() {
    return await this.self.child('div').withAttribute("kind").exists
  }

}
