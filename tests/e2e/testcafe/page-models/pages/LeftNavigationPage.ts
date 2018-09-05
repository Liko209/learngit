/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-22 17:16:18
 * Copyright © RingCentral. All rights reserved.
 */
import { AnchorSelector } from '../../utils';
import { BasePage } from '..';

export class LeftNavigationPage extends BasePage {
  redirect(url: string): this {
    return this.chain(async (t) => {
      await t.click(AnchorSelector(url));
      const href = await t.eval(() => document.URL);
      await t.expect(href).contains(url.toLocaleLowerCase());
    });
  }
}
