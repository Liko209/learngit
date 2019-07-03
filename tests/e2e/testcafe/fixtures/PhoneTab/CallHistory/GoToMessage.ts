/*
 * @Author: allen.lian
 * @Date: 2019-07-01 15:46:48
 * Copyright © RingCentral. All rights reserved.
 */


import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';


import * as assert from 'assert'
import { addOneCallLogFromGuest } from './utils';
import { userInfo } from 'os';

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['FIJI-4682'],
  maintainers: ['Allen.Lian'],
  keywords: ['voicemail']
})('Go to conversation from the voicemail', async (t) => {
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
    await app.homePage.phoneTab.callHistoryEntry.enter();
  });

  await h(t).withLog('Then call history page should be open', async () => {
    await callhistoryPage.ensureLoaded();
  });

  const telephoneDialog = app.homePage.telephonyDialog;
  if (await telephoneDialog.exists) {
    await telephoneDialog.clickMinimizeButton()
  }

  await addOneCallLogFromGuest(t, caller, callee, app);


  const callhistoryItem = callhistoryPage.callhistoryItemByNth(0);
  const callhistoryId = await callhistoryItem.id;
  const callhistoryName = await callhistoryItem.callerName.textContent;

  await h(t).withLog('When I click Message button', async (step) => {
    step.setMetadata('id', callhistoryId)
    await callhistoryItem.ClickMessageButton();
  });

  const conversationPage = app.homePage.messageTab.conversationPage; 
   
  await h(t).withLog(`Then the conversation should be open`, async () => {
    await t.expect(conversationPage.title.textContent).eql(callhistoryName);
  });

  
});
