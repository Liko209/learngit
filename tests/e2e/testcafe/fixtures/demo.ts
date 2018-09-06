/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { BlankPage } from '../page-models/pages/BlankPage';
import { EnvironmentSelectionPage } from '../page-models/pages/EnvironmentSelectionPage';
import { RingcentralSignInNavigationPage } from '../page-models/pages/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/pages/RingcentralSignInPage';
import { SITE_URL, SITE_ENV } from '../config';

import { formalName } from '../libs/filter';
import { setUp, tearDown, TestHelper } from '../libs/helpers';

declare var test: TestFn;
fixture('Demo')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

test(formalName('Sign In Success', ['P0', 'SignIn', 'demo']), async (t) => {
  const helper = TestHelper.from(t);
  new BlankPage(t)
    .navigateTo(SITE_URL)
    .shouldNavigateTo(EnvironmentSelectionPage)
    .selectEnvironment(SITE_ENV)
    .toNextPage()
    .chain(async (t, h) => {
      const client702 = await h.glipApiManager.getClient(h.users.user702, h.companyNumber);
      client702.sendPost(h.teams.team1_u1_u2.glip_id, { text: 'hello world' });
    })
    .log('Success to send post to team1')
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .setCredential(helper.companyNumber)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension(helper.users.user701.extension)
    .setPassword(helper.users.user701.password)
    .signIn();
});
