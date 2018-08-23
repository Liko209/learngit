/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-22 17:16:18
 * Copyright © RingCentral. All rights reserved.
 */
import { ClientFunction } from 'testcafe';
import { BasePage } from './BasePage';

export default class LeftNavPage extends BasePage {
  redirect(url: string): this {
    return this.chain(async t => {
      await t.click(this.select(url));
      const href = await t.eval(() => document.URL);
      await t.expect(href).contains(url.toLocaleLowerCase());
    });
  }
}
