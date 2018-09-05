/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:46:24
 * Copyright © RingCentral. All rights reserved.
 */
import { Role } from 'testcafe';
import { SITE_URL } from '../config';
import { TestHelper } from '../libs/helpers';
import { BlankPage } from '../page-models/pages/BlankPage';
import { RingcentralSignInNavigationPage } from '../page-models/pages/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/pages/RingcentralSignInPage';
import { UnifiedLoginPage } from '../page-models/pages/UnifiedLoginPage';

type AuthInfo = {
  credential: string;
  extension?: string;
  password: string;
};

function createRole(authInfo?: AuthInfo) {
  return Role(
    SITE_URL,
    async t => await unifiedLogin(t, authInfo),
  );
}

function unifiedLogin(t: TestController, authInfo?: AuthInfo) {
  let credential: string = '';
  let extension: string = '';
  let password: string = '';

  if (authInfo) {
    ({ credential, password } = authInfo);
    extension = authInfo.extension || '';
  } else {
    const helper = TestHelper.from(t);
    credential = helper.companyNumber;
    extension = helper.users.user701.extension;
    password = helper.users.user701.password;
  }

  return new BlankPage(t)
    .log(`account: ${credential} extension: ${extension}`)
    .navigateTo(SITE_URL)
    .shouldNavigateTo(UnifiedLoginPage)
    .clickLogin()
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .setCredential(credential)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension(extension)
    .setPassword(password)
    .signIn();
}

export { AuthInfo, unifiedLogin, createRole };
