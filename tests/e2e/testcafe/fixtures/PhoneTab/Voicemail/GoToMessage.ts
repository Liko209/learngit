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
import { addOneVoicemailFromExt } from './utils';
import { userInfo } from 'os';

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['FIJI-2394'],
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

  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click voicemail entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.phoneTab.voicemailEntry.enter();
  });

  await h(t).withLog('Then voicemail page should be open', async () => {
    await voicemailPage.ensureLoaded();
  });

  const telephoneDialog = app.homePage.telephonyDialog;
  if (await telephoneDialog.exists) {
    await telephoneDialog.clickMinimizeButton()
  }

  await addOneVoicemailFromExt(t, caller, callee, app);


  const voicemailItem = voicemailPage.voicemailItemByNth(0);
  const voicemailId = await voicemailItem.id;
  const voicemailName = await voicemailItem.callerName.textContent;


  await h(t).withLog('When I click Message button', async (step) => {
    step.setMetadata('id', voicemailId)
    await voicemailItem.ClickMessageButton();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`Then the conversation should be open`, async () => {
    await t.expect(conversationPage.title.textContent).eql(voicemailName);
  });


  const messageTab = app.homePage.leftPanel.messagesEntry;

  await h(t).withLog(`Open Message page`, async () => {
    await messageTab.enter();
  });

  const phoneTab = app.homePage.leftPanel.phoneEntry;

  await h(t).withLog(`Open Phone page`, async () => {
    await phoneTab.enter();
    await voicemailPage.ensureLoaded();
  });

});

