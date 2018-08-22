/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:46:24
 * Copyright © RingCentral. All rights reserved.
 */
import { TestHelper } from '../libs/helpers';
import { SITE_URL } from '../config';
import { BlankPage } from '../page-models/BlankPage';
import { RingcentralSignInNavigationPage } from '../page-models/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/RingcentralSignInPage';
import { UnifiedLoginPage } from '../page-models/UnifiedLoginPage';
import { MainPage } from '../page-models/MainPage';

function login(t: TestController) {
  const helper = TestHelper.from(t);
  return new BlankPage(t)
    .open(SITE_URL)
    .shouldNavigateTo(UnifiedLoginPage)
    .clickLogin()
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .setCredential(helper.companyNumber)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension(helper.users.user701.extension)
    .setPassword(helper.users.user701.password)
    .signIn()
    .shouldNavigateTo(MainPage);
}

export { login };
