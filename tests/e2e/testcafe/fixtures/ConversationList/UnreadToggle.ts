/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-30 10:36:08
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';

fixture('ConversationList/UnreadToggle')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-193', "JPT-198"],
  keywords: ['ConversationList', 'UnreadToggle'],
  maintainers: ['potar.he', 'chris.zhan']
})('Show unread conversations only when unread toggle is on & The conversation list is refreshed when the toggle status is changed', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const anotherUser = users[5];
  await h(t).scenarioHelper.resetProfileAndState(loginUser);
  const meChatId = await h(t).glip(loginUser).getMeChatId()


  let readChat = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [loginUser, users[1]],
  }

  let readTeam = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, anotherUser],
  }


  let unreadChatInFavorite = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser],
  }

  let unreadGroup = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [loginUser, anotherUser, users[0]],
  }
  let unreadTeam = <IGroup>{
    type: 'Team',
    name: `Team-UMI ${uuid()}`,
    owner: loginUser,
    members: [loginUser, anotherUser],
  }


  let unreadConversations = [unreadChatInFavorite, unreadGroup, unreadTeam];
  let conversations = unreadConversations.concat([readChat, readTeam]);


  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);
  await h(t).withLog('And create some converations', async () => {
    await h(t).scenarioHelper.createTeamsOrChats(conversations);
  });

  await h(t).withLog('And make 3 conversation withe umi', async () => {
    for (const group of unreadConversations) {
      await h(t).scenarioHelper.sendTextPost(uuid(), group, anotherUser);
    }
  });

  await h(t).withLog('And favorite unread one chat before login', async () => {
    await h(t).glip(loginUser).favoriteGroups([unreadChatInFavorite.glipId, meChatId]);
  });

  const app = new AppRoot(t);
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  const unreadToggler = app.homePage.messageTab.unReadToggler;

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I Should find unread toggle and the default state is off', async () => {
    await t.expect(unreadToggler.exists).ok();
    await unreadToggler.shouldBeOff();
  }, true);

  await h(t).withLog('And All prepared conversation should be visible', async () => {
    await favoritesSection.conversationEntryById(unreadChatInFavorite.glipId).shouldBeVisible();
    await directMessagesSection.conversationEntryById(unreadGroup.glipId).shouldBeVisible();
    await directMessagesSection.conversationEntryById(readChat.glipId).shouldBeVisible();
    await teamsSection.conversationEntryById(unreadTeam.glipId).shouldBeVisible();
    await teamsSection.conversationEntryById(readTeam.glipId).shouldBeVisible();
  }, true);

  await h(t).withLog('When I click the unread  to turn it on', async () => {
    await unreadToggler.turnOn();
  });

  await h(t).withLog('Then the state of the toggle should be on and conversations without unread messages should be hidden, except  conversations with UMI', async () => {
    await unreadToggler.shouldBeOn();
    await favoritesSection.conversationEntryById(unreadChatInFavorite.glipId).shouldBeVisible();
    await directMessagesSection.conversationEntryById(unreadGroup.glipId).shouldBeVisible();
    await directMessagesSection.conversationEntryById(readChat.glipId).shouldBeInvisible();
    await teamsSection.conversationEntryById(unreadTeam.glipId).shouldBeVisible();
    await teamsSection.conversationEntryById(readTeam.glipId).shouldBeInvisible();
  }, true);

  await h(t).withLog('When I click the unread toggle to turn it off', async () => {
    await unreadToggler.turnOff();
  });

  await h(t).withLog('Then the state of the toggle should be off and all prepared conversations should be visible', async () => {
    await unreadToggler.shouldBeOff();
    await favoritesSection.conversationEntryById(unreadChatInFavorite.glipId).shouldBeVisible();
    await directMessagesSection.conversationEntryById(unreadGroup.glipId).shouldBeVisible();
    await directMessagesSection.conversationEntryById(readChat.glipId).shouldBeVisible();
    await teamsSection.conversationEntryById(unreadTeam.glipId).shouldBeVisible();
    await teamsSection.conversationEntryById(readTeam.glipId).shouldBeVisible();
  }, true);
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-194', 'JPT-201', 'JPT-202'],
  keywords: ['ConversationList', 'UnreadToggle'],
  maintainers: ['potar.he', 'chris.zhan']
})('The conversation list should be hidden from the list when turn unread toggle on and navigates from a conversation & The opened conversation remain opened, and it should be displayed on the conversation list when turn unread toggle on', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const anotherUser = users[5];
  await h(t).scenarioHelper.resetProfileAndState(loginUser);

  let team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, anotherUser],
  }

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser],
  }

  await h(t).withLog('Given I have a extension with two conversations: chat A and team B', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team, chat]);
  });

  await h(t).withLog('And both conversations has one umi', async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), team, anotherUser);
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, anotherUser);
  });

  await h(t).withLog('And set last group id is chat A', async () => {
    await h(t).glip(loginUser).setLastGroupId(chat.glipId);
  });

  const app = new AppRoot(t);
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const unreadToggler = app.homePage.messageTab.unReadToggler;

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  // JPT-194
  await h(t).withLog('Then I Should find unread toggle and the default state is off', async () => {
    await t.expect(unreadToggler.exists).ok();
    await unreadToggler.shouldBeOff();
  }, true);


  await h(t).withLog('Then the current group should be chat A ', async () => {
    await app.homePage.messageTab.conversationPage.groupIdShouldBe(chat.glipId);
  });

  // JPT-202
  await h(t).withLog('When I click the unread  to turn it on', async () => {
    await unreadToggler.turnOn();
  });

  await h(t).withLog('Then chat A remains opened and show in conversation list', async () => {
    await unreadToggler.shouldBeOn();
    await directMessagesSection.conversationEntryById(chat.glipId).shouldBeVisible();
  }, true);

  // JPT-201
  await h(t).withLog('When I click team B', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('Then chat A is hidden from conversation list', async () => {
    await directMessagesSection.conversationEntryById(chat.glipId).shouldBeInvisible();
  }, true);

  await h(t).withLog('When chat A receive one new message', async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, anotherUser)
  });

  await h(t).withLog('Then chat A shows in conversation list', async () => {
    await directMessagesSection.conversationEntryById(chat.glipId).shouldBeVisible();
  }, true);
});