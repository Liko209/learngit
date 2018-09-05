/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:30:42
 * Copyright © RingCentral. All rights reserved.
 */
import { Selector } from 'testcafe';
import { ReactSelector } from 'testcafe-react-selectors';
import { BasePage } from '..';

class UnifiedLoginPage extends BasePage {
  get loginButton() {
    return Selector('button[type="submit"]');
  }

  get envSelect() {
    return ReactSelector('EnvSelect');
  }

  clickLogin(): this {
    return this.click(this.loginButton);
  }

}

export { UnifiedLoginPage };
