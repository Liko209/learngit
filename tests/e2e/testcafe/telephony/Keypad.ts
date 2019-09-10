/*
 * @Author: Potar.He
 * @Date: 2019-04-19 12:16:25
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-06-06 13:48:00
 */


import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../v2/models";
import { SITE_URL, BrandTire } from '../config';
import { WebphoneSession } from 'webphone-client';
import { E911Address } from './e911address';

fixture('Telephony/Keypad')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1621'],
  maintainers: ['Potar.He'],
  keywords: ['keypad']
})('Navigate to the "keypad" page', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a 1:1 chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // outbound call without answer
  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('When I open the 1:1 chat', async () => {
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(conversationPage.telephonyButton).ok();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And click the keypad button', async () => {
    await telephonyDialog.clickKeypadButton();
  });

  await h(t).withLog('Then the telephony dialog should navigate to the keypad page', async () => {
    // todo: find a reliable away to ensure it
    await t.expect(telephonyDialog.hideKeypadPageButton.exists).ok();
  });

});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1622'],
  maintainers: ['Potar.He'],
  keywords: ['keypad']
})('Hide the keypad page', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a 1:1 chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
  });

  let session: WebphoneSession;
  await h(t).withLog('And anpther user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // outbound call without answer
  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('When I open the 1:1 chat', async () => {
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(conversationPage.telephonyButton).ok();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And click the keypad button', async () => {
    await telephonyDialog.clickKeypadButton();
  });

  await h(t).withLog('Then the telephony dialog should navigate to the keypad page', async () => {
    // todo: find a reliable away to ensure it
    await t.expect(telephonyDialog.hideKeypadPageButton.exists).ok();
  });

  await h(t).withLog('When I click the hide button(on the left side of the arrow “<-”)', async () => {
    await telephonyDialog.clickHideKeypadButton();
  });

  await h(t).withLog('Then telephony dialog should navigate back to the active call page, hide the keypad page', async () => {
    await t.expect(telephonyDialog.keypadButton.exists).ok();
    await t.expect(telephonyDialog.hideKeypadPageButton.exists).notOk();
  });

  // inbound call
  await h(t).withLog('When I close hangup the call', async () => {

    await telephonyDialog.clickHangupButton();
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog(`And I have a inbound call from webphone: ${anotherUser.company.number}#${anotherUser.extension}`, async () => {
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('Then the telephone dialog should be loaded', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I click the answer button', async () => {
    await telephonyDialog.clickAnswerButton();
  });

  await h(t).withLog('And click the keypad button', async () => {
    await telephonyDialog.clickKeypadButton();
  });

  await h(t).withLog('Then the telephony dialog should navigate to the keypad page', async () => {
    // todo: find a reliable away to ensure it
    await t.expect(telephonyDialog.hideKeypadPageButton.exists).ok();
  });

  await h(t).withLog('When I click the hide button(on the left side of the arrow “<-”)', async () => {
    await telephonyDialog.clickHideKeypadButton();
  });

  await h(t).withLog('Then telephony dialog should navigate back to the active call page, hide the keypad page', async () => {
    await t.expect(telephonyDialog.keypadButton.exists).ok();
    await t.expect(telephonyDialog.hideKeypadPageButton.exists).notOk();
  });

});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1625'],
  maintainers: ['Potar.He'],
  keywords: ['keypad']
})('Can end the call on the keypad page', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a 1:1 chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
  });

  let session: WebphoneSession;
  await h(t).withLog('And anpther user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // outbound call with answer
  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('When I open the 1:1 chat', async () => {
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(conversationPage.telephonyButton).ok();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('An antherUser (webphone) answer the call ', async () => {
    await session.answer();
    await session.waitForStatus('accepted');
  });

  await h(t).withLog('And click the keypad button', async () => {
    await telephonyDialog.clickKeypadButton();
  });

  await h(t).withLog('Then the telephony dialog should navigate to the keypad page', async () => {
    // todo: find a reliable away to ensure it
    await t.expect(telephonyDialog.hideKeypadPageButton.exists).ok();
  });

  await h(t).withLog('When I click the "end" button', async () => {
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('Then the telephone dialog should be closed', async () => {
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('And the webphone session status should be "terminated', async () => {
    await session.waitForStatus('terminated');
  });

  // inbound call
  await h(t).withLog(`When I have a inbound call from webphone: ${anotherUser.company.number}#${anotherUser.extension}`, async () => {
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('Then the telephone dialog should be loaded', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I click the answer button', async () => {
    await telephonyDialog.clickAnswerButton();
  });

  await h(t).withLog('And click the keypad button', async () => {
    await telephonyDialog.clickKeypadButton();
  });

  await h(t).withLog('Then the telephony dialog should navigate to the keypad page', async () => {
    // todo: find a reliable away to ensure it
    await t.expect(telephonyDialog.hideKeypadPageButton.exists).ok();
  });

  await h(t).withLog('When I click the "end" button', async () => {
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('Then the telephone dialog should be closed', async () => {
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('And the webphone session status should be "terminated', async () => {
    await session.waitForStatus('terminated');
  });

});



test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1645'],
  maintainers: ['Potar.He'],
  keywords: ['keypad']
})('DTMF instruction executed successfully', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a 1:1 chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // outbound call without answer
  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('When I open the 1:1 chat', async () => {
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(conversationPage.telephonyButton).ok();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And click the keypad button', async () => {
    await telephonyDialog.clickKeypadButton();
  });

  await h(t).withLog('Then the telephony dialog should navigate to the keypad page', async () => {
    // todo: find a reliable away to ensure it
    await t.expect(telephonyDialog.hideKeypadPageButton.exists).ok();
  });

  await h(t).withLog('When I click "##" on the keypad ', async () => {
    await telephonyDialog.tapKeypad('##');
  });

  await h(t).withLog('Then the keys history should be "##"', async () => {
    await telephonyDialog.keysRecordShouldBe('##')
  });

  // TODO: checkout webphone DTMF

});
