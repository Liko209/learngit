/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:17:03
 * Copyright © RingCentral. All rights reserved.
 */

import { BasePage } from '..';
import { Selector } from 'testcafe';

export class RingcentralSignInNavigationPage extends BasePage {

  get credentialField(): Selector {
    return Selector('input[name=\'credential\']');
  }

  get nextButton(): Selector {
    return Selector('[data-test-automation-id=\'loginCredentialNext\']');
  }

  setCredential(credential: string | number): this {
    return this.chain(async t =>
      await t.typeText(this.credentialField, String(credential)),
    );
  }

  toNextPage(): this {
    return this.chain(async t =>
      await t.click(this.nextButton),
    );
  }
}
