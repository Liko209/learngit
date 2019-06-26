/*
 * @Author: Potar.He
 * @Date: 2019-06-06 09:53:59
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-06-12 11:01:39
 */

import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta, IUser } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { WebphoneSession } from '../../../v2/webphone/session';
import * as assert from 'assert'

fixture('PhoneTab/CallLog')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

  async function ensuredOneVoicemail(t: TestController, caller: IUser, callee: IUser, app) {
    const voicemailPage = app.homePage.phoneTab.voicemailPage;
    const telephoneDialog = app.homePage.telephonyDialog;
  
    let hasCallLog = await voicemailPage.items.count;
    if (hasCallLog == 0) {
      await h(t).log('There is not any voicemail record. now make one voicemail...')
      let callerSession: WebphoneSession;
      await h(t).withLog('When I login webphone with {number}#{extension}', async (step) => {
        step.initMetadata({
          number: caller.company.number,
          extension: caller.extension
        })
        callerSession = await h(t).newWebphoneSession(caller);
      });
  
      await h(t).withLog('and caller session makeCall to callee', async () => {
        await callerSession.makeCall(`${callee.company.number}#${callee.extension}`);
      });
  
      await h(t).withLog('Then the telephone dialog should be popup', async () => {
        await telephoneDialog.ensureLoaded();
      });
  
      await h(t).withLog('When callee click "end " button', async () => {
        await telephoneDialog.clickHangupButton();
      });
  
      await h(t).withLog('And refresh page', async () => {
        await t.wait(5e3);
        await h(t).reload();
        await app.homePage.ensureLoaded();
      });
  
      await h(t).withLog('Then the call log page has one record', async (step) => {
        await t.expect(voicemailPage.items.count).eql(1, { timeout: 60e3 });
      });
    }
  }

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2340'],
  maintainers: ['Skye.Wang'],
  keywords: ['callHistory']
})('Delete all call log', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[5];
  const callee = h(t).rcData.mainCompany.users[6];

  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I click Phone entry of leftPanel and click call log entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.phoneTab.callHistoryEntry.enter();
  });

  await h(t).withLog('Then call history page should be open', async () => {
    await callHistoryPage.ensureLoaded();
  });

  const telephoneDialog = app.homePage.telephonyDialog;
  if (await telephoneDialog.exists) {
    await telephoneDialog.clickMinimizeButton()
  }

  await h(t).withLog('When I Click delete all call log button', async () => {
    await callHistoryPage.clickDeleteAllButton;
  });

});
