/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:16:51
 * Copyright © RingCentral. All rights reserved.
 */

import { BasePage } from './BasePage';
import { Status } from '../libs/report';

export class BlankPage extends BasePage {

  open(url: string): this {
    return this.chain(async (t) => {
      await t.navigateTo(url);
      await this.log(`open ${url}`, Status.PASSED, true);
    });
  }
}
