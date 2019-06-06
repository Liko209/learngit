/*
 * @Author: isaac.liu
 * @Date: 2019-05-29 16:52:12
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';

import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('DisablePhoneUser')
  .beforeEach(setupCase(BrandTire.RC_VOIP_DISABLE))
  .afterEach(teardownCase());


test.skip(formalName('Check will open message section when no phone permission', ['P2', 'JPT-2052', 'PhoneTab', 'Isaac.Liu']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  await h(t).platform(user).init();
  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  const leftPanel = app.homePage.leftPanel;
  await h(t).withLog('And there should be no phone entry', async () => {
    await leftPanel.phoneEntry.ensureDismiss();
  });

  await h(t).withLog('And I go to /phone url, it should stay at /message', async () => {
    const url = new URL(SITE_URL)
    const oldURL = `${url.origin}/message`;
    const NEW_URL = `${url.origin}/phone`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
    await t.expect(h(t).href).eql(oldURL);
  });
});
