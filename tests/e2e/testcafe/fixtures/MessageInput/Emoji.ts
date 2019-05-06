/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */


import * as faker from 'faker/locale/en';
import { v4 as uuid } from 'uuid';

import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';

fixture('Send Messages')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'], caseIds: ['JPT-1702'], keywords: ['emoji'], maintainers: ['Potar.he']
})('Can send emoji via emoji library', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  let chat = <IGroup> {
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[1]]
  }

  const app = new AppRoot(t);
  await h(t).withLog(`Given I have a chat with ${anotherUser.extension}`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter a chat conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.expand();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And I click Emoji button', async () => {
    await conversationPage.clickEmojiButton();
  });

  await h(t).withLog('Then the emoji library should be open', async () => {
    await app.homePage.messageTab.emojiLibrary.ensureLoaded();
  });

});
