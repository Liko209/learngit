import {BaseWebComponent} from "./BaseWebComponent";
import {MenuItem} from "./MenuItem";

export class MenuDiv extends BaseWebComponent {

  itemIndex: number;

  divIndex: number;

  constructor(protected t: TestController, readonly parent: BaseWebComponent, readonly index: number) {
    super(t);
    this.itemIndex = 0;
    this.divIndex = 0;
  }

  get self() {
    return this.parent.self.child('div').nth(this.index);
  }

  async hasNextItem() {
    return await this.self.child('a').nth(this.itemIndex).exists;
  }

  async nextItem() {
    return new MenuItem(this.t, this, this.itemIndex++)
  }

  async hasNextDiv() {
    return await this.self.child('div').nth(this.divIndex).exists;
  }

  async nextDiv() {
    return new MenuDiv(this.t, this, this.divIndex++)
  }

  async childCount() {
    return await this.self.child('div a').count;
  }

}
