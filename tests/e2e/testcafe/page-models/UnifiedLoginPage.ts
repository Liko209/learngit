/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:30:42
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
