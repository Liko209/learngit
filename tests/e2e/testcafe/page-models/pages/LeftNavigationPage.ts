/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-22 17:16:18
 * Copyright © RingCentral. All rights reserved.
 */
import { AutomationSelector } from '../../utils';
import { BasePage } from '..';

export class LeftNavigationPage extends BasePage {
  redirect(id: string): this {
    return this.chain(async (t) => {
      await t.click(AutomationSelector(id));
      const href = await t.eval(() => document.URL);
      await t.expect(href).contains(id.toLocaleLowerCase());
    });
  }
}
