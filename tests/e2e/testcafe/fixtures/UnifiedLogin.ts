/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../libs/filter';
import { setupCase, teardownCase } from "../init";
import { h } from '../v2/helpers';
import { BlankPage } from '../page-models/pages/BlankPage';

import { SITE_URL } from "../config";
import { UnifiedLoginPage } from '../page-models/pages/UnifiedLoginPage';
import { RingcentralSignInNavigationPage } from '../page-models/pages/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/pages/RingcentralSignInPage';
import { TokenGetterPage } from '../page-models/pages/TokenGetterPage';
import { Home } from '../page-models/components';

fixture('Unified Login')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Unified Login', ['JPT-67', 'P0', 'Login']), async (t) => {
  const user = h(t).rcData.mainCompany.users[0]
  await h(t).fromPage(BlankPage)
    .navigateTo(SITE_URL)
    .shouldNavigateTo(UnifiedLoginPage)
    .clickLogin()
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .cleanInput()
    .setCredential(user.company.number)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension(user.extension)
    .setPassword(user.password)
    .signIn()
    .log('fetch rc token and glip token')
    .shouldNavigateTo(TokenGetterPage)
    .expectUrlParamsIsCorrect()
    .log('expect exist home react component')
    .shouldNavigateTo(Home)
    .expectExistComponent();
});
