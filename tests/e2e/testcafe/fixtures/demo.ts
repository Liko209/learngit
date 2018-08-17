/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { BlankPage } from '../page-models/BlankPage';
import { EnvironmentSelectionPage } from '../page-models/EnvironmentSelectionPage';
import { RingcentralSignInNavigationPage } from '../page-models/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/RingcentralSignInPage';
import { SITE_URL, SITE_ENV } from '../config';

import { formalName } from '../libs/filter';
import { setUp, tearDown } from '../libs/helpers';

fixture('Demo')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown())

test(formalName('Sign In Success', ['P0', 'SignIn']), async t => {
  await new BlankPage(t)
    .open(SITE_URL)
    .shouldNavigateTo(EnvironmentSelectionPage)
    .selectEnvironment(SITE_ENV)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .setCredential(`${t.ctx.data.mainCompanyNumber}`)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension(t.ctx.data.users.user701.extension)
    .setPassword(t.ctx.data.users.user701.password)
    .signIn()
    .execute();
});
