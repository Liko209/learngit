/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../libs/filter';
import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { SITE_URL } from '../config';

fixture('Demo')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Sign In Success', ['P0', 'SignIn', 'demo']), async (t) => {
  const user = h(t).rcData.mainCompany.users[0];
  await h(t).directLoginWithUser(SITE_URL, user);
  await t.wait(10e3);
  const a11yReport = await h(t).a11yHelper.attestCheck();
  console.log(JSON.stringify(a11yReport, null, 2));
});
