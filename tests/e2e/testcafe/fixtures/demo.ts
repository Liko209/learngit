/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { BlankPage } from '../page-models/BlankPage';
import { EnvironmentSelectionPage } from '../page-models/EnvironmentSelectionPage';
import { RingcentralSignInNavigationPage } from '../page-models/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/RingcentralSignInPage';
import { AccountOperationsApi as AccountPool } from 'account-pool-ts-api';
import { envName, siteUrl } from '../config';

fixture('My fixture')
.beforeEach(async t=> {
    const accountPoolClient = new AccountPool();
    const data = (await accountPoolClient.snatchAccount(envName.toLowerCase(), 'rcBetaUserAccount', undefined, "false")).body;
    t.ctx.data = data;
  }
)
.afterEach(async t=> {
    const accountPoolClient = new AccountPool();
    await accountPoolClient.releaseAccount(envName, t.ctx.data.accountType, t.ctx.data.companyEmailDomain);
  }
)

test('Sign In Success', async (t) => {
  await new BlankPage(t)
      .open(siteUrl)
      .shouldNavigateTo(EnvironmentSelectionPage)
      .selectEnvironment(envName)
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
