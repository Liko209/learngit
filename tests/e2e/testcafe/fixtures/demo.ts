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
import { setUp, tearDown, TestHelper } from '../libs/helpers';

declare var test: TestFn;
fixture.skip('Demo')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

test(formalName('Sign In Success', ['P0', 'SignIn']), async t => {
  const helper = TestHelper.from(t);

  let page;
  await (page = new BlankPage(t)
    .open(SITE_URL)
    .shouldNavigateTo(EnvironmentSelectionPage)
    .selectEnvironment(SITE_ENV)
    .toNextPage()
  );

  const client702 = await helper.glipApiManager.getClient(helper.users.user702, helper.companyNumber);
  await client702.sendPost(helper.teams.team1_u1_u2.glip_id, { text: 'hello world' });

  await (page = page
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .setCredential(helper.companyNumber)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension(helper.users.user701.extension)
    .setPassword(helper.users.user701.password)
    .signIn()
  );
});
