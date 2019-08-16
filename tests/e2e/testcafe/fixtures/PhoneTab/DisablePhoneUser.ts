/*
 * @Author: isaac.liu
 * @Date: 2019-05-29 16:52:12
 * Copyright © RingCentral. All rights reserved.
 */

import { h } from '../../v2/helpers';

import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from '../../v2/models';

fixture('DisablePhoneUser')
  .beforeEach(setupCase(BrandTire.RC_VOIP_DISABLE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-2052'], keywords: ['PhoneTab'], maintainers: ['Isaac.Liu']
})('Check will open message section when no phone permission', async t => {
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  const leftPanel = app.homePage.leftPanel;
  await h(t).withLog('Then there should be no phone entry', async () => {
    await leftPanel.phoneEntry.ensureDismiss();
  });

  const url = new URL(SITE_URL)
  const oldURL = `${url.origin}/messages/`;
  const NEW_URL = `${url.origin}/phone`;
  await h(t).withLog('When I go to /phone url, it should stay at /messages/', async () => {
    await t.navigateTo(NEW_URL);
  });

  await h(t).withLog('Then it should stay at /messages/', async () => {
    await app.homePage.ensureLoaded();
    await t.expect(h(t).href).eql(oldURL);
  });
});
