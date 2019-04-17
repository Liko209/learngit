/*
 * @Author: Potar.He 
 * @Date: 2019-03-14 15:24:53 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-14 15:56:35
 */

import { v4 as uuid } from 'uuid';
import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../v2/models";
import { SITE_URL, BrandTire } from '../config';

fixture('Telephony/EntryPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1541'],
  maintainers: ['Potar.He'],
  keywords: ['Hold', 'UnHold']
})('User can hold the call', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4]
  const anotherUser = users[5];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a 1:1 chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // conversation page header
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
    const session = await h(t).webphone(anotherUser);
    await session.preOperate("answerCall", true);
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

});