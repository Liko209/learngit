/*
 * @Author: isaac.liu
 * @Date: 2019-05-28 10:13:17
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';

import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('PhoneTab')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Will open onboarding dialer when first sign in and open phone tab', ['P2', 'JPT-2065', 'PhoneTab', 'Isaac.Liu']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const user = users[4];
  await h(t).platform(user).init();
  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  const leftPanel = app.homePage.leftPanel;
  await h(t).withLog('And click Phone section, I will see callhistory & voicemail', async () => {
    await leftPanel.phoneEntry.enter();
  });

  await h(t).withLog('And I will see the dialer', async () => {
    await t.expect(app.homePage.telephonyDialog.visible).eql(true);
  });

  await h(t).withLog('And I logout & login again', async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, user);
  });

  await h(t).withLog('And click Phone section, I will not see the dialer', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.telephonyDialog.ensureDismiss();
  });
});

test(formalName('Check can open the default tab when open Phone section', ['P2', 'JPT-2050', 'PhoneTab', 'Isaac.Liu']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const user = users[4];
  await h(t).platform(user).init();
  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  const leftPanel = app.homePage.leftPanel;
  await h(t).withLog('And click Phone section, I will see callhistory & voicemail', async () => {
    await leftPanel.phoneEntry.enter();
    const phoneTab = app.homePage.phoneTab;
    await t.expect(phoneTab.getSubEntry('phone-tab-callhistory').visible).eql(true);
    await t.expect(phoneTab.getSubEntry('phone-tab-voicemail').visible).eql(true);
  });

  await h(t).withLog('And I reload the page, I will still stay in Phone Tab, P2, JPT-2055', async () => {
    const oldURL = await h(t).href;
    await h(t).reload();
    await app.homePage.ensureLoaded();
    await t.expect(h(t).href).eql(oldURL);
  });
});
