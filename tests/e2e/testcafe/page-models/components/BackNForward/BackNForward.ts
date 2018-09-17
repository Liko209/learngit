/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-13 10:19:22
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseComponent } from '../..';
import { ReactSelector } from 'testcafe-react-selectors';

class BackNForward extends BaseComponent {
  get backwardBtn(): Selector {
    return ReactSelector('JuiIconButton').withProps({ tooltipTitle: 'Backward' });
  }
  get forwardBtn(): Selector {
    return ReactSelector('JuiIconButton').withProps({ tooltipTitle: 'Forward' });
  }
  get avatar() {
    return ReactSelector('TopBar').findReact('JuiAvatar');
  }
  get signOutBtn() {
    return ReactSelector('TopBar').findReact('MenuList');
  }
  public getLeftNavBtn(index: number): Selector {
    return  ReactSelector('NavItem').nth(index);
  }
  public clickBackwardBtn() {
    return this.clickElement(this.backwardBtn);
  }

  public backwardNForwardBtnShouldBeDisabled() {
    return this.chain(async (t) => {
      const forwardComponent = await this.forwardBtn.getReact();
      const backComponent = await this.backwardBtn.getReact();
      await t.expect(backComponent.props.disabled).eql(true);
      await t.expect(forwardComponent.props.disabled).eql(true);
    });
  }

  public clickForwardBtn() {
    return this.clickElement(this.forwardBtn);
  }
  public clickLeftNavBtn(index: number = 2) {
    return this.clickElement(this.getLeftNavBtn(index));
  }
  public clickAvatar() {
    return this.clickElement(this.avatar);
  }
  public clickSignOut() {
    return this.clickElement(this.signOutBtn);
  }
}
export { BackNForward };
