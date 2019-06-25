import {BaseWebComponent} from "./BaseWebComponent";
import {MenuItem} from "./MenuItem";
import {MenuDiv} from "./MenuDiv";
import {Selector} from 'testcafe';

export class MenuRoot extends BaseWebComponent {

  itemIndex: number;

  divIndex: number;

  constructor(protected t: TestController) {
    super(t);
    this.itemIndex = 0;
    this.divIndex = 0;
  }

  get self() {
    return Selector('.container').find('section').nth(0);
  }

  async hasNextItem() {
    return await this.self.child('a').nth(this.itemIndex).exists;
  }

  async nextItem() {
    return new MenuItem(this.t, this, this.itemIndex++);
  }

  async nextDiv() {
    return new MenuDiv(this.t, this, this.divIndex++);
  }

  async menuItemCount() {
    return await this.self.child('a').count;
  }
}
