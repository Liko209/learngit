/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { BlankPage } from '../page-models/BlankPage';
import { EnvironmentSelectionPage } from '../page-models/EnvironmentSelectionPage';
import { RingcentralSignInNavigationPage } from '../page-models/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/RingcentralSignInPage';
import { SITE_URL, ENV_NAME, CONFIG } from '../config';
import accountPoolHelper from '../libs/AccountPoolHelper';

fixture('My fixture')
.beforeEach(async t => {
    const data = await accountPoolHelper.checkOutAccounts(CONFIG.ACCOUNT_POOL_ENV, 'rcBetaUserAccount');
    t.ctx.data = data;
  }
)
.afterEach(async t => {
    await accountPoolHelper.checkInAccounts(CONFIG.ACCOUNT_POOL_ENV, t.ctx.data.accountType, t.ctx.data.companyEmailDomain);
  }
)

test('Sign In Success', async t => {
  await new BlankPage(t)
      .open(SITE_URL)
      .shouldNavigateTo(EnvironmentSelectionPage)
      .selectEnvironment(ENV_NAME)
      .toNextPage()
      .shouldNavigateTo(RingcentralSignInNavigationPage)
      .setCredential(t.ctx.data.users.user701.rc_id)
      .toNextPage()
      .shouldNavigateTo(RingcentralSignInPage)
      .setExtension(t.ctx.data.users.user701.extension)
      .setPassword(t.ctx.data.users.user701.password)
      .signIn()
      .execute();
});
