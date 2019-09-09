/*
 * @Author: allen.lian
 * @Date: 2019-07-03 11:21:14
 * Copyright © RingCentral. All rights reserved.
 */


import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';

import { addOneMissCallLogFromAnotherUser } from './utils';

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2364'],
  maintainers: ['Allen.Lian'],
  keywords: ['voicemail']
})('Call back from the call history', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const callee = users[4];
  const caller = users[5];

  const app = new AppRoot(t);



  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  const callhistoryPage = app.homePage.phoneTab.callHistoryPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click call history entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    const telephoneDialog = app.homePage.telephonyDialog;
    if (await telephoneDialog.exists) {
      await app.homePage.closeE911Prompt()
      await telephoneDialog.clickMinimizeButton();
    }
    await app.homePage.phoneTab.callHistoryEntry.enter();
  });

  await h(t).withLog('Then call history page should be open', async () => {
    await callhistoryPage.ensureLoaded();
  });

  await addOneMissCallLogFromAnotherUser(t, caller, callee, app);


  const callhistoryItem = callhistoryPage.callHistoryItemByNth(0);
  const callhistoryId = await callhistoryItem.id;

  await h(t).withLog('When I click Call back button', async (step) => {
    step.setMetadata('id', callhistoryId)
    await callhistoryItem.ClickCallbackButton();
  });

  const telephonyDialog = app.homePage.telephonyDialog;

  await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
    await telephonyDialog.ensureLoaded();
    await t.wait(5e3);
    await telephonyDialog.clickHangupButton();
    await t.wait(5e3);
  });

});
