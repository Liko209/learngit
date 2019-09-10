/*
 * @Author: Yilia Hong (yilia.hong@ringcentral.com)
 * @Date: 2018-12-24 14:01:17
 * Copyright © RingCentral. All rights reserved.
 */
import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('ConversationList/OpenConversation')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Should remains where it is when click a conversation in the conversation list.', ['P2', 'JPT-464', 'ConversationList', 'Yilia Hong']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];

  let team1 = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }
  let team2 = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with two conversation in teams section', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team1, team2]);
  });

  const app = new AppRoot(t);
  const teamsSection = app.homePage.messageTab.teamsSection;

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let teamId;
  await h(t).withLog('When I open the second conversation 2', async () => {
    await teamsSection.expand();
    await teamsSection.nthConversationEntry(1).enter();
    await t.wait(2e3);
    teamId = await app.homePage.messageTab.conversationPage.currentGroupId;
  });

  await h(t).withLog('Then the conversation 2 still remain in the second', async () => {
    await teamsSection.nthConversationEntry(1).groupIdShouldBe(teamId);
  });

  await h(t).withLog('When I refresh page', async () => {
    await h(t).reload();
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then the conversation 2 display in the second', async () => {
    await teamsSection.nthConversationEntry(1).groupIdShouldBe(teamId);
  });
});


test(formalName('Should not display in conversation list when last conversation was closed', ['P2', 'JPT-566', 'ConversationList', 'Yilia Hong']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let chat = <IGroup>{
    type: "DirectMessage",
    members: [loginUser, users[0]],
    owner: loginUser
  }

  await h(t).withLog('Given I have a directMessage conversation', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('The conversation should be last conversation', async () => {
    await h(t).glip(loginUser).setLastGroupId(chat.glipId);
  });

  await h(t).withLog('The last conversation should be closed before login', async () => {
    await h(t).glip(loginUser).hideGroups([chat.glipId]);
  });

  const app = new AppRoot(t);
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then the conversation should not display in conversation list', async () => {
    await t.expect(directMessagesSection.conversationEntryById(chat.glipId).exists).notOk();
    const url = new URL(SITE_URL);
    const targetUrl = `${url.origin}/messages/`
    await t.expect(h(t).href).eql(targetUrl);
  });
});

test(formalName('Should open the last opened conversation for some conditions', ['P2', 'JPT-2154', 'ConversationList', 'Yilia Hong']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];

  let team1 = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }
  let team2 = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with two conversation in teams section', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team1, team2]);
  });

  const app = new AppRoot(t);
  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('The conversation team1 should be last conversation', async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).setLastGroupId(team1.glipId);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I open the conversation team2', async () => {
    await teamsSection.conversationEntryById(team2.glipId).enter();
    await t.wait(5e3); // Wait for sending API success
  });

  await h(t).withLog(`When I relogin with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, loginUser);
  });

  await h(t).withLog('Then show the last opened conversation team2', async () => {
    await conversationPage.groupIdShouldBe(team2.glipId);
  });
});
