/*
 * @Author: Alexander Zaverukha (alexander.zaverukha@ringcentral.com)
 * @Date: 2019-04-17 10:14:54
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../libs/filter';
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta } from '../v2/models';
import { WebphoneSession } from 'webphone-client';

fixture('Telephony/ToVoiceMail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-1510'],
  priority: ['P2'],
  maintainers: ['ali.naffaa'],
  keywords: ['VoiceMail']
})('User can receive the new incoming call  when user ignored the incoming call', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).scenarioHelper.resetProfile(loginUser);
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const loginUserWebPhone = await h(t).newWebphoneSession(loginUser);
  let callerWebPhone = undefined;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I also login in another platform (webphone) ${caller.company.number}#${caller.extension}`, async () => {
    callerWebPhone = await h(t).newWebphoneSession(caller);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I receive an in-comming call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('And I ignore this in-comming call in Jupiter', async () => {
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickIgnoreButton();
  });

  await h(t).withLog('Then this call should be ignored in Jupiter', async () => {
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('But in the other platform (webPhone) this call should still ringing', async () => {
    await loginUserWebPhone.update();
    const actual = loginUserWebPhone.status;

    await t.expect(actual).eql('invited');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-1595'],
  priority: ['P1'],
  maintainers: ['ali.naffaa'],
  keywords: ['VoiceMail']
})('Can send to voicemail when receiving an incoming call', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).scenarioHelper.resetProfile(loginUser);
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  let callerWebPhone: WebphoneSession;

  await h(t).withLog(`Given I login in another platform (webphone) ${caller.company.number}#${caller.extension}`, async () => {
    callerWebPhone = await h(t).newWebphoneSession(caller);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I receive an incoming call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('And I click the to voicemail button in Jupiter', async () => {
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickSendToVoiceMailButton();
  });

  await h(t).withLog('Then the Jupiter navigate back to the view it was before the call rang', async () => {
    await telephonyDialog.ensureDismiss();
  });

});
