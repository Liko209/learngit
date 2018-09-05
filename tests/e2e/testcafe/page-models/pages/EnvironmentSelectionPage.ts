/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:16:08
 * Copyright © RingCentral. All rights reserved.
 */

import { BasePage } from '..';
import { Selector } from 'testcafe';

export class EnvironmentSelectionPage extends BasePage {

  get loginButton() {
    return Selector('button');
  }

  get environmentSelector() {
    return Selector('select');
  }

  get environmentOption() {
    return this.environmentSelector.find('option');
  }

  selectEnvironment(environment: string): this {
    return this.chain(async t =>
      await t
        .click(this.environmentSelector)
        .click(this.environmentOption.withText(environment))
        .expect(this.environmentSelector.value)
        .eql(environment),
    );
  }

  toNextPage(): this {
    return this.chain(async t =>
      await t.click(this.loginButton),
    );
  }

}
