/*
 * @Author: Yilia Hong (yilia.hong@ringcentral.com)
 * @Date: 2019-08-19 15:02:06
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta } from '../v2/models';

fixture('Telephony/MultipleCalls')
  .beforeEach(setupCase(BrandTire.CALL_LOG_USER0_WITH_OTHERS))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-2773'],
  priority: ['P1'],
  maintainers: ['Yilia.Hong'],
  keywords: ['MultipleCalls']
})('Can receive incoming call when user on a call.', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller1 = h(t).rcData.mainCompany.users[1];
  const caller2 = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone1 = await h(t).newWebphoneSession(caller1);
  const callerWebPhone2 = await h(t).newWebphoneSession(caller2);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Given I on a call', async () => {
    await callerWebPhone1.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();    
  });

  await h(t).withLog('When I receive an incoming call', async () => {
    await callerWebPhone2.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('Then Login user can receive the incoming call', async () => {
    await t.expect(telephonyDialog.endAndAnswerButton.exists).ok();    
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone1.hangup();
    await callerWebPhone1.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2776'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['MultipleCalls']
})('Back to previous call when incoming call ended by the remote side.', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller1 = h(t).rcData.mainCompany.users[1];
  const caller2 = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone1 = await h(t).newWebphoneSession(caller1);
  const callerWebPhone2 = await h(t).newWebphoneSession(caller2);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Given I on a call', async () => {
    await callerWebPhone1.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();   
  });

  await h(t).withLog('And I minimize the call window', async () => {
    await telephonyDialog.clickMinimizeButton();
  });

  await h(t).withLog('When I receive an incoming call', async () => {
    await callerWebPhone2.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('When the incoming call ended by the remote side', async () => {
    await callerWebPhone2.hangup();
    await callerWebPhone2.waitForStatus('terminated');
  });

  await h(t).withLog('Then back to previous call', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone1.hangup();
    await callerWebPhone1.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2777'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['MultipleCalls']
})('Incoming call UI change when previous call ended by the remote side.', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller1 = h(t).rcData.mainCompany.users[1];
  const caller2 = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone1 = await h(t).newWebphoneSession(caller1);
  const callerWebPhone2 = await h(t).newWebphoneSession(caller2);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Given I on a call', async () => {
    await callerWebPhone1.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok(); 
  });

  await h(t).withLog('And I enter content in input field', async () => {
    await telephonyDialog.clickKeypadButton();
    await telephonyDialog.tapKeypad('1');
  });

  await h(t).withLog('When I receive an incoming call', async () => {
    await callerWebPhone2.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('When the previous call ended by the remote side', async () => {
    await callerWebPhone1.hangup();
    await callerWebPhone1.waitForStatus('terminated');
  });

  await h(t).withLog('Then the incoming call UI changed', async () => {
    await t.expect(telephonyDialog.answerButton.exists).ok();
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone2.hangup();
    await callerWebPhone2.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2778'],
  priority: ['P1'],
  maintainers: ['Yilia.Hong'],
  keywords: ['MultipleCalls']
})('Answer new call and end previous call when click the [End&Answer] button.', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller1 = h(t).rcData.mainCompany.users[1];
  const caller2 = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone1 = await h(t).newWebphoneSession(caller1);
  const callerWebPhone2 = await h(t).newWebphoneSession(caller2);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Given I on a call', async () => {
    await callerWebPhone1.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok(); 
  });

  await h(t).withLog('When I receive an incoming call', async () => {
    await callerWebPhone2.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('When I click the [End&Answer] button.', async () => {
    await telephonyDialog.clickEndAndAnswerButton();
  });

  await h(t).withLog('Then the previous call ended', async () => {
    await callerWebPhone1.waitForStatus('terminated');
  });

  await h(t).withLog('Then the new call answered', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone2.hangup();
    await callerWebPhone2.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2780'],
  priority: ['P1'],
  maintainers: ['Yilia.Hong'],
  keywords: ['MultipleCalls']
})('Current call should NOT be affected when do some actions for incoming call.', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller1 = h(t).rcData.mainCompany.users[1];
  const caller2 = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone1 = await h(t).newWebphoneSession(caller1);
  const callerWebPhone2 = await h(t).newWebphoneSession(caller2);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Given I on a call', async () => {
    await callerWebPhone1.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok(); 
  });

  await h(t).withLog('When I receive an incoming call', async () => {
    await callerWebPhone2.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await t.expect(telephonyDialog.endAndAnswerButton.exists).ok();    
  });

  await h(t).withLog('And I ignore the incoming call', async () => {
    await telephonyDialog.clickIgnoreButton();
  });

  await h(t).withLog('Then back to the previous call', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I receive an incoming call', async () => {
    await callerWebPhone2.hangup();
    await callerWebPhone2.waitForStatus('terminated');
    await callerWebPhone2.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await t.expect(telephonyDialog.endAndAnswerButton.exists).ok();    
  });

  await h(t).withLog('And I send to voicemail the incoming call', async () => {
    await telephonyDialog.clickSendToVoiceMailButton();
  });

  await h(t).withLog('Then back to the previous call', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I receive an incoming call', async () => {
    await callerWebPhone2.hangup();
    await callerWebPhone2.waitForStatus('terminated');
    await callerWebPhone2.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await t.expect(telephonyDialog.endAndAnswerButton.exists).ok();    
  });

  await h(t).withLog('And I forward the incoming call', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.hoverForwardButton();
    await telephonyDialog.clickCustomForwardButton();
    await telephonyDialog.tapKeypad('101');
    await telephonyDialog.clickForwardActionButton();
  });

  await h(t).withLog('Then back to the previous call', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I receive an incoming call', async () => {
    await callerWebPhone2.hangup();
    await callerWebPhone2.waitForStatus('terminated');
    await callerWebPhone2.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await t.expect(telephonyDialog.endAndAnswerButton.exists).ok();    
  });

  await h(t).withLog('And I reply the incoming call', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickReplyActionButton();
    await telephonyDialog.clickReplyInMeetingButton();
  });

  await h(t).withLog('Then back to the previous call', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone1.hangup();
    await callerWebPhone1.waitForStatus('terminated');
    await callerWebPhone2.hangup();
    await callerWebPhone2.waitForStatus('terminated');
  });
});