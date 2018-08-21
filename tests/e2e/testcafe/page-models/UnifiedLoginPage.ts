/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:17:10
 * Copyright © RingCentral. All rights reserved.
 */

import { BasePage } from './BasePage';

const ANCHORS = {
  BTN_LOGIN: 'btnLogin',
};
const { BTN_LOGIN } = ANCHORS;

class UnifiedLoginPage extends BasePage {
  clickLogin(): this {
    return this.click(BTN_LOGIN);
  }
}

export { UnifiedLoginPage };
