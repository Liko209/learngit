/*
 * @Author: Potar.He
 * @Date: 2019-04-19 12:16:25
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-04-19 12:18:34
 */


import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../v2/models";
import { SITE_URL, BrandTire } from '../config';
import { WebphoneSession } from 'webphone-client';
import { E911Address } from './e911address';

fixture('Telephony/EntryPoint')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1541', 'JPT-1544'],
  maintainers: ['Potar.He'],
  keywords: ['Hold', 'UnHold']
})('User can hold/unhold the call', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);
  // await h(t).platform(loginUser).updateDevices(() => E911Address);

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
  await h(t).withLog('And another user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // outbound call
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

  await h(t).withLog('And anotherUser answer the call', async () => {
    await session.answer();
  });

  await h(t).withLog('Then the hold button is available', async () => {
    await t.expect(telephonyDialog.holdButton.hasAttribute('disabled')).notOk();
  });

  await h(t).withLog('When I click the hold button', async () => {
    await telephonyDialog.clickHoldButton();
  });

  // TODO: Check voice

  await h(t).withLog('Then "hold" button changed to "unhold" button', async () => {
    await t.expect(telephonyDialog.holdButton.exists).notOk();
    await t.expect(telephonyDialog.unHoldButton.exists).ok();
    await t.expect(telephonyDialog.unHoldButton.hasAttribute('disabled')).notOk();
  });

  await h(t).withLog('When I click the "unhold" button', async () => {
    await telephonyDialog.clickUnHoldButton();
  });

  // TODO: Check voice

  await h(t).withLog('Then "unhold" button changed to "hold" button', async () => {
    await t.expect(telephonyDialog.unHoldButton.exists).notOk();
    await t.expect(telephonyDialog.holdButton.exists).ok();
    await t.expect(telephonyDialog.holdButton.hasAttribute('disabled')).notOk();
  });

  await h(t).withLog('And I hold up the call', async () => {
    await telephonyDialog.clickHangupButton();
  });

  // inbound call
  await h(t).withLog('When anotherUser make call to me', async () => {
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('And I answer the call', async () => {
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
  });

  await h(t).withLog('Then the hold button is available', async () => {
    await t.expect(telephonyDialog.holdButton.hasAttribute('disabled')).notOk();
  });

  await h(t).withLog('When I click the hold button', async () => {
    await telephonyDialog.clickHoldButton();
  });

  // TODO: Check voice

  await h(t).withLog('Then "hold" button changed to "unhold" button', async () => {
    await t.expect(telephonyDialog.holdButton.exists).notOk();
    await t.expect(telephonyDialog.unHoldButton.exists).ok();
    await t.expect(telephonyDialog.unHoldButton.hasAttribute('disabled')).notOk();
  });

  await h(t).withLog('When I click the "unhold" button', async () => {
    await telephonyDialog.clickUnHoldButton();
  });

  // TODO: Check voice

  await h(t).withLog('Then "unhold" button changed to "hold" button', async () => {
    await t.expect(telephonyDialog.unHoldButton.exists).notOk();
    await t.expect(telephonyDialog.holdButton.exists).ok();
    await t.expect(telephonyDialog.holdButton.hasAttribute('disabled')).notOk();
  });


});
