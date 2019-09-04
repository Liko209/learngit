/*
 * @Author: allen.lian
 * @Date: 2019-07-03 13:24:28
 * Copyright © RingCentral. All rights reserved.
 */


import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';

import { addOneVoicemailFromAnotherUser } from './utils';

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2364'],
  maintainers: ['Allen.Lian'],
  keywords: ['voicemail']
})('Call back from the voicemail', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const callee = users[2];
  const caller = users[3];

  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click voicemail entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    const telephoneDialog = app.homePage.telephonyDialog;
    if (await telephoneDialog.exists) {
      await app.homePage.closeE911Prompt()
      await telephoneDialog.clickMinimizeButton();
    }
    await app.homePage.phoneTab.voicemailEntry.enter();
  });

  await h(t).withLog('Then call history page should be open', async () => {
    await voicemailPage.ensureLoaded();
  });

  await addOneVoicemailFromAnotherUser(t, caller, callee, app);


  const voicemailItem = voicemailPage.voicemailItemByNth(0);
  const voicemailId = await voicemailItem.id;

  await h(t).withLog('When I click Call back button', async (step) => {
    step.setMetadata('id', voicemailId)
    await voicemailItem.ClickCallbackButton();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
    await telephonyDialog.ensureLoaded();
    await t.wait(1e3);
    await telephonyDialog.clickHangupButton();
  });
});
