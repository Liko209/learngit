/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-11 16:46:02
 * Copyright © RingCentral. All rights reserved.
 */
import { AutomationSelector } from '../../utils';
import { BasePage } from '..';

export class LeftNavState extends BasePage {
  toggle(): this {
    return this.chain(async (t) => {
      await t.click(AutomationSelector('toggleBtn'));
    });
  }
  reload() {
    return this.chain(async (t) => {
      await t.eval(() => location.reload(true));
    });
  }
  size(w: number) {
    return this.chain(async (t) => {
      const navPanelWidth = AutomationSelector('leftPanel').clientWidth;
      await t.expect(navPanelWidth).eql(w);
    });
  }
}
