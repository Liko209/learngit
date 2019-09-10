/*
 * @Author: Yilia Hong (yilia.hong@ringcentral.com)
 * @Date: 2019-08-27 14:29:26
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta } from '../v2/models';

fixture('Telephony/Transfer')
  .beforeEach(setupCase(BrandTire.CALL_LOG_USER0_WITH_OTHERS))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-2769'],
  priority: ['P1'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Blind transfer is successfully', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad('103');
  });

  await h(t).withLog('And click [Transfer] button', async () => {
    await telephonyDialog.clickTransferNowButton();
  });

  const alertText = 'Call transferred'
  await h(t).withLog('Then blind transfer success', async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone.hangup();
    await callerWebPhone.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2770'],
  priority: ['P1'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Send to voicemail to transferred user is successfully', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad('105');
  });

  await h(t).withLog('And click [To Voicemail] button', async () => {
    await telephonyDialog.clickTransferToVoicemailButton();
  });

  const alertText = 'Call transferred'
  await h(t).withLog('Then blind transfer success', async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone.hangup();
    await callerWebPhone.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2774'],
  priority: ['P1'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Warm transfer is successfully when user click the ask first button', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const callee = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);
  const calleeWebPhone = await h(t).newWebphoneSession(callee);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    const extension = callee.extension;
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad(extension);
  });

  await h(t).withLog('And click [Ask first] button', async () => {
    await telephonyDialog.clickTransferAskFirstButton();
  });

  await h(t).withLog('Then transfer user receive call and answer it', async () => {
    await calleeWebPhone.answer();
  });

  await h(t).withLog('And enter complete transfer page', async () => {
    await t.expect(telephonyDialog.completeTransferButton.exists).ok();
  });

  await h(t).withLog('When I click [Complete transfer] button', async () => {
    await telephonyDialog.clickCompleteTransferButton();
  });

  const alertText = 'Call transferred'
  await h(t).withLog('Then warm transfer success', async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2767'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Can back to the previous page when remote side call is ended', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad('105');
  });

  await h(t).withLog('And remote side end the call', async () => {
    await callerWebPhone.hangup();
    await callerWebPhone.waitForStatus('terminated');
  });

  await h(t).withLog('Then back to the previous page', async () => {
    await t.expect(telephonyDialog.self.visible).notOk();
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2763'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Can back to the previous page when user at the complete transfer page then either party end the call', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const callee = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);
  const calleeWebPhone = await h(t).newWebphoneSession(callee);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    const extension = callee.extension;
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad(extension);
  });

  await h(t).withLog('And click [Ask first] button', async () => {
    await telephonyDialog.clickTransferAskFirstButton();
  });

  await h(t).withLog('Then transfer user receive call and ended the call', async () => {
    await calleeWebPhone.answer();
    await calleeWebPhone.hangup();
    await calleeWebPhone.waitForStatus('terminated');
  });

  await h(t).withLog('And enter active call page', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone.hangup();
    await callerWebPhone.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2763'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Can back to the previous page when user at the complete transfer page then login user end one call', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const callee = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);
  const calleeWebPhone = await h(t).newWebphoneSession(callee);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    const extension = callee.extension;
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad(extension);
  });

  await h(t).withLog('And click [Ask first] button', async () => {
    await telephonyDialog.clickTransferAskFirstButton();
  });

  await h(t).withLog('Then transfer user receive call and answer it', async () => {
    await calleeWebPhone.answer();
  });

  await h(t).withLog('And enter complete transfer page', async () => {
    await t.expect(telephonyDialog.completeTransferButton.exists).ok();
  });

  await h(t).withLog('When I end one call', async () => {
    await telephonyDialog.clickCancelTransferButton();
  });

  await h(t).withLog('Then enter active call page', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone.hangup();
    await callerWebPhone.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2763'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Can back to the previous page when user at the complete transfer page then both remote side end the call', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const callee = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);
  const calleeWebPhone = await h(t).newWebphoneSession(callee);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    const extension = callee.extension;
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad(extension);
  });

  await h(t).withLog('And click [Ask first] button', async () => {
    await telephonyDialog.clickTransferAskFirstButton();
  });

  await h(t).withLog('Then transfer user receive call and answer it', async () => {
    await calleeWebPhone.answer();
  });

  await h(t).withLog('And enter complete transfer page', async () => {
    await t.expect(telephonyDialog.completeTransferButton.exists).ok();
  });

  await h(t).withLog('When both remote side end the call', async () => {
    await callerWebPhone.hangup();
    await callerWebPhone.waitForStatus('terminated');
    await calleeWebPhone.hangup();
    await calleeWebPhone.waitForStatus('terminated');
  });

  await h(t).withLog('Then dialer dismiss', async () => {
    await t.expect(telephonyDialog.self.visible).notOk();
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2763'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Can back to the previous page when user at the complete transfer page then transfer user send to voicemail', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const callee = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);
  const calleeWebPhone = await h(t).newWebphoneSession(callee);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    const extension = callee.extension;
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad(extension);
  });

  await h(t).withLog('And click [Ask first] button', async () => {
    await telephonyDialog.clickTransferAskFirstButton();
  });

  await h(t).withLog('When transfer user send to voicemail', async () => {
    await calleeWebPhone.toVoiceMail();
  });

  await h(t).withLog('Then stay in complete transfer page', async () => {
    await t.expect(telephonyDialog.completeTransferButton.exists).ok();
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2771'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('End call button shows "End call" tooltip at the complete transfer page', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const callee = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);
  const calleeWebPhone = await h(t).newWebphoneSession(callee);
  const tooltipText = 'End call'

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    const extension = callee.extension;
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad(extension);
  });

  await h(t).withLog('And click [Ask first] button', async () => {
    await telephonyDialog.clickTransferAskFirstButton();
  });

  await h(t).withLog('Then transfer user receive call and answer it', async () => {
    await calleeWebPhone.answer();
  });

  await h(t).withLog('And enter complete transfer page', async () => {
    await t.expect(telephonyDialog.completeTransferButton.exists).ok();
  });

  await h(t).withLog('When I hover on the [End call] button', async () => {
    await telephonyDialog.hoverCancelTransferButton();
  });

  await h(t).withLog(`Then display a tooltip: '${tooltipText}`, async () => {
    await telephonyDialog.showTooltip(tooltipText);
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2802'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Complete transfer button shows "Complete transfer" tooltip', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const callee = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);
  const calleeWebPhone = await h(t).newWebphoneSession(callee);
  const tooltipText = 'Complete transfer'

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    const extension = callee.extension;
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad(extension);
  });

  await h(t).withLog('And click [Ask first] button', async () => {
    await telephonyDialog.clickTransferAskFirstButton();
  });

  await h(t).withLog('Then transfer user receive call and answer it', async () => {
    await calleeWebPhone.answer();
  });

  await h(t).withLog('And enter complete transfer page', async () => {
    await t.expect(telephonyDialog.completeTransferButton.exists).ok();
  });

  await h(t).withLog('When I hover on the [Complete transfer] button', async () => {
    await telephonyDialog.hoverCompleteTransferButton();
  });

  await h(t).withLog(`Then display a tooltip: '${tooltipText}`, async () => {
    await telephonyDialog.showTooltip(tooltipText);
  });
});
