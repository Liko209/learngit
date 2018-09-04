/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:46:24
 * Copyright © RingCentral. All rights reserved.
 */
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

export { AuthInfo, unifiedLogin };
