import { BaseComponent } from '../..';
import { ReactSelector } from 'testcafe-react-selectors';
class BackNForward extends BaseComponent {
  get backwardBtn(): Selector {
    return ReactSelector('JuiIconButton').nth(1).findReact('button');
  }
  get forwardBtn(): Selector {
    return ReactSelector('JuiIconButton').nth(2).findReact('button');
  }
  public getLeftNavBtn(index: number): Selector {
    return  ReactSelector('NavItem').nth(index);
  }
  public clickBackwardBtn() {
    return this.clickElement(this.backwardBtn);
  }
  public clickForwardBtn() {
    return this.clickElement(this.forwardBtn);
  }
  public clickLeftNavBtn(index: number = 2) {
    return this.clickElement(this.getLeftNavBtn(index));
  }
}
export { BackNForward };
