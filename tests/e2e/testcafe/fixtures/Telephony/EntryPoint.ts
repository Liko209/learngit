/*
 * @Author: Potar.He 
 * @Date: 2019-03-14 15:24:53 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-14 15:56:35
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';

fixture('Telephony/EntryPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('User should be able to see the 1:1 Call button in different entry points', ['JPT-1354', 'p1', 'Potar.He', 'EntryPoint']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4]
  const anotherUser = users[5];
  const app = new AppRoot(t);
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a 1:1 chat, another user send a post', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
    await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), chat, anotherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open the 1:1 chat', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(conversationPage.telephonyButton).ok();
  });

  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then should start call and display call UI', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I click the hand up button', async () => {
    await telephonyDialog.clickHandUpButton();
  });

  await h(t).withLog('Then telephony dialog dismiss', async () => {
    await t.expect(telephonyDialog.exists).notOk();
  });

});