/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-05-09 14:02:11
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta } from '../v2/models';

fixture('Telephony/Reply')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-1704'],
  priority: ['P2'],
  maintainers: ['shining.miao'],
  keywords: ['Reply']
})('Can should The tooltip "More options" of "more" button is showed', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const tooltipText = 'More options';
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

  await h(t).withLog('When I hover on the to more options button', async () => {
    await telephonyDialog.hoverMoreOptionsButton();
  });

  await h(t).withLog(`Then Display a tooltip: '${tooltipText}`, async () => {
    await telephonyDialog.showTooltip(tooltipText);
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-1707'],
  priority: ['P2'],
  maintainers: ['shining.miao'],
  keywords: ['Reply']
})('Can should The tooltip "Back" of "back" button is showed', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const tooltipText = 'Back';
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

  await h(t).withLog('And I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('Click the reply option', async () => {
    await telephonyDialog.clickReplyActionButton();
  });

  await h(t).withLog('When I hover on the to back action button', async () => {
    await telephonyDialog.hoverReplyBackActionButton();
  });

  await h(t).withLog(`Then Display a tooltip: '${tooltipText}`, async () => {
    await telephonyDialog.showTooltip(tooltipText);
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1712'],
  maintainers: ['shining.miao'],
  keywords: ['Reply']
})('Reply the pre-defined message is successful', async(t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const tooltipText = 'More options';
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // Inbound call
  await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('Click the reply option', async () => {
    await telephonyDialog.clickReplyActionButton();
  });

  await h(t).withLog('Click the reply with In Meeting', async () => {
    await telephonyDialog.clickReplyInMeetingButton();
  });

  const alertText = 'Your voice message was sent successfully.'
  await h(t).withLog(`And there should be success flash toast (short = 2s) displayed "${alertText}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('Then telephony dialog should dismiss', async () => {
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });

  // Inbound call
  await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('Click the reply option', async () => {
    await telephonyDialog.clickReplyActionButton();
  });

  await h(t).withLog('Click the reply with will call back entry button', async () => {
    await telephonyDialog.clickReplyWithWillCallBackEntryButton();
  });

  await h(t).withLog('Click the reply with will call back 5 min button', async () => {
    await telephonyDialog.clickReplyWithWillCallBack5MinButton();
  });

  await h(t).withLog('Then telephony dialog should dismiss', async () => {
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });
})
test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1717', 'JPT-1726'],
  maintainers: ['peng.yu'],
  keywords: ['Reply']
})('Reply with custom message is successful', async(t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const tooltipText = 'More options';
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // Inbound call
  await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('Click the reply option', async () => {
    await telephonyDialog.clickReplyActionButton();
  });

  await h(t).withLog('Click the custom message text area and input please call me later', async () => {
    await telephonyDialog.typeCustomReplyMessage('please call me later');
  });

  await h(t).withLog('Click enter to send the custom reply message', async () => {
    await telephonyDialog.sendCustomReplyMessage();
  });

  await h(t).withLog('Then telephony dialog should dismiss', async () => {
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });
})

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1721'],
  maintainers: ['peng.yu'],
  keywords: ['Reply']
})('Can not reply with blank or empty custom message', async(t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const tooltipText = 'More options';
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // Inbound call
  await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('Click the reply option', async () => {
    await telephonyDialog.clickReplyActionButton();
  });

  const alertText = 'Sorry, you cannot send an empty message.'

  await h(t).withLog('Click the custom message text area and input empty message', async () => {
    await telephonyDialog.typeCustomReplyMessage('    ');
  });

  await h(t).withLog('Click enter to send the custom reply message', async () => {
    await telephonyDialog.sendCustomReplyMessage();
  });

  await h(t).withLog(`And there should be failed flash toast (short = 3s) displayed "${alertText}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('Then telephony dialog should keep exist', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });
})
