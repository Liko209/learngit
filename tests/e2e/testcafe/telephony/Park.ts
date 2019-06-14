/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-06-05 20:06:03
 * Copyright © RingCentral. All rights reserved.
 */

import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta } from '../v2/models';

fixture('Telephony/Park')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-2172'],
  priority: ['P2'],
  maintainers: ['shining.miao'],
  keywords: ['Park']
})('Should park call successfully when active a call', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And I answer the call', async () => {
    await telephonyDialog.clickAnswerButton();
  });

  await h(t).withLog('And I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('Click the park option', async () => {
    await telephonyDialog.clickParkActionButton();
  });

  await h(t).withLog('And there should be success flash toast (short = 2s) displayed', async () => {
    await app.homePage.alertDialog.ensureLoaded();
  });

  await h(t).withLog('Click toast dismiss button', async () => {
    await app.homePage.alertDialog.clickDismissButton();
  });

  await h(t).withLog('Toast should be dismiss', async () => {
    await app.homePage.alertDialog.shouldBeDismiss();
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });
});
