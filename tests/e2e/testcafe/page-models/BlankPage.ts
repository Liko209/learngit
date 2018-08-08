/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:16:51
 * Copyright © RingCentral. All rights reserved.
 */

import { BasePage } from './BasePage';

export class BlankPage extends BasePage {

  open(url: string): this {
    return this.chain(t =>
      t.navigateTo(url),
    );
  }
}
