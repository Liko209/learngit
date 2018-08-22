/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:17:10
 * Copyright © RingCentral. All rights reserved.
 */

import { BasePage } from './BasePage';
import { Selector } from 'testcafe';

export class RingcentralSignInPage extends BasePage {

  get credentialField(): Selector {
    return Selector('input[name="credential"]');
  }

  get extensionField(): Selector {
    return Selector('input[name="PIN"]');
  }

  get passwordField(): Selector {
    return Selector('#password');
  }

  get signInButton(): Selector {
    return Selector('[data-test-automation-id="signInBtn"]');
  }

  setCredential(credential: string): this {
    return this.chain(async t =>
      await t.typeText(this.credentialField, credential),
    );
  }

  setExtension(extension: string): this {
    return this.chain(async t =>
      await t.typeText(this.extensionField, extension),
    );
  }

  setPassword(password: string): this {
    return this.chain(async t =>
      await t.typeText(this.passwordField, password),
    );
  }

  signIn(): this {
    return this.chain(async t =>
      await t.click(this.signInButton),
    );
  }
}
