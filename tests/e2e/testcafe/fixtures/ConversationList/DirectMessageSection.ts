/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';

fixture('DirectMessageSection')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-5'], keywords: ['ConversationList'], maintainers: ['henry.Xu']
})('Show the 1:1 conversation and group conversation in the Direct Message section', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, users[5]]
  }

  const group = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [loginUser, users[5], users[6]]
  }

  await h(t).withLog('Given I have an extension with 1 private chat and 1 group chat', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat, group]);
  });

  await h(t).withLog('And send a post to ensure the created chat and group in Section', async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, loginUser);
    await h(t).scenarioHelper.sendTextPost(uuid(), group, loginUser);
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can find 1 private chat and 1 group chat in direct messages section', async () => {
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    await directMessagesSection.expand();
    await t.expect(directMessagesSection.conversationEntryById(chat.glipId).exists).ok()
    await t.expect(directMessagesSection.conversationEntryById(group.glipId).exists).ok()
  }, true);
});