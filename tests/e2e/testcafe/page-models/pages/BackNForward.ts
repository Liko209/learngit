/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-13 10:19:22
 * Copyright © RingCentral. All rights reserved.
 */
import { AutomationSelector } from '../../utils';
import { BasePage } from '..';

class BackNForward extends BasePage {
  get backwardBtn() {
    return AutomationSelector('Back');
  }
  get forwardBtn() {
    return AutomationSelector('Forward');
  }
  get avatar() {
    return AutomationSelector('topBarAvatar');
  }
  get signOutBtn() {
    return AutomationSelector('signOut');
  }
  public getLeftNavBtn(id: string) {
    return AutomationSelector(id);
  }
  public clickBackwardBtn() {
    return this.chain(async (t) => {
      await t.click(this.backwardBtn);
    });
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
    return this.chain(async (t) => {
      await t.click(this.forwardBtn);
    });
  }
  public clickLeftNavBtn(id: string = 'phone') {
    return this.chain(async (t) => {
      await t.click(this.getLeftNavBtn(id));
    });
  }
  public clickAvatar() {
    return this.chain(async (t) => {
      await t.click(this.avatar);
    });
  }
  public clickSignOut() {
    return this.chain(async (t) => {
      await t.click(this.signOutBtn);
    });
  }
}
export { BackNForward };
