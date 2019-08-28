/*
 * @Author: Potar (Potar.He@ringcentral.com)
 * @Date: 2018-01-16 17:16:38
 * Copyright © RingCentral. All rights reserved.
 */
import * as uuid from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('ConversationList/TeamSection')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-872'],
  maintainers: ['potar.he'],
  keywords: ['ConversationList', 'search'],
})('Should keep its position in the conversation list and NOT be moved to the top of the list when the conversation exists in the left list', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[7];
  const otherUser = users[5];
  const firstChatUser = users[6]
  await h(t).glip(loginUser).init();
  const otherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', otherUser.rcId);

  let nonTopChat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }
  let topChat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, firstChatUser]
  }

  let postId;
  await h(t).withLog(`Given I at least two private chats`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([topChat, nonTopChat]);
  })

  await h(t).withLog(`And the second chat has mentions/bookmark post `, async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`${uuid()} ![:Person](${loginUser.rcId})`, nonTopChat, loginUser);
    await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), topChat, loginUser);

    await h(t).glip(loginUser).updateProfile({
      favorite_post_ids: [+postId]
    });
    await h(t).glip(loginUser).clearAllUmi();
  });

  const app = new AppRoot(t);
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const mentionPage = app.homePage.messageTab.mentionPage;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const searchDialog = app.homePage.searchDialog;

  // Login -> Last open DM conversation B
  await h(t).withLog(`And I set last open conversation B:${otherUserName}`, async () => {
    await h(t).glip(loginUser).setLastGroupId(nonTopChat.glipId);
  });

  await h(t).withLog(`When I login with extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionFixed(nonTopChat.glipId, otherUserName);

  // open via mentions
  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation B: ${otherUserName}`, async () => {
    await app.homePage.messageTab.mentionsEntry.enter();
    await mentionPage.postItemById(postId).hoverPostAndClickJumpToConversationButton();
  });

  await stepsToCheckPositionFixed(nonTopChat.glipId, otherUserName);

  // open via bookmark
  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation B: ${otherUserName}`, async () => {
    await app.homePage.messageTab.bookmarksEntry.enter();
    await bookmarkPage.postItemById(postId).hoverPostAndClickJumpToConversationButton();
  });

  await stepsToCheckPositionFixed(nonTopChat.glipId, otherUserName);

  // open via URL
  await h(t).withLog(`When I open conversation B: ${otherUserName} via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.origin}/messages/${nonTopChat.glipId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionFixed(nonTopChat.glipId, otherUserName);

  // open via search other user name
  await h(t).withLog(`When I search the showed privateChat ${otherUserName} and click it`, async () => {
    await app.homePage.header.searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(otherUserName);
    await t.wait(3e3);
    await searchDialog.instantPage.nthPeople(0).enter();
  });

  await stepsToCheckPositionFixed(nonTopChat.glipId, otherUserName);

  async function stepsToCheckPositionFixed(chatId: string, chatName: string) {
    await h(t).withLog(`Then "${chatName}" should keep its position 2 in directMessage section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await directMessagesSection.nthConversationEntry(1).groupIdShouldBe(chatId);
      await t.wait(2e3);
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then "${chatName}" should keep its position 2 directMessage section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await directMessagesSection.nthConversationEntry(1).groupIdShouldBe(chatId);
    });
  }
});


// skip due to bug: https://jira.ringcentral.com/browse/FIJI-3278
test.skip.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-463'],
  maintainers: ['potar.he'],
  keywords: ['ConversationList', 'search'],
})('Should display in the top of conversation list when opening a conversation and it is out of the left list', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[7];
  const otherUser = users[5];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).setMaxTeamDisplay(3); // if use hide group, no show last Group

  let topTeam = <IGroup>{
    type: 'Team',
    name: `Top-${uuid()}`,
    owner: loginUser,
    members: [loginUser, otherUser],
  }
  let team1 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser],
  }
  let team2 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser],
  }
  let team3 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser],
  }

  let privateChatInListIds: string[];
  await h(t).withLog(`Given team conversation B: "${topTeam.name}" and some private chats`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([topTeam, team1, team2, team3]);
    privateChatInListIds = [team1.glipId, team2.glipId, team3.glipId];
  });

  let postId;
  await h(t).withLog(`And B with at mention and bookmark post and clear all umi`, async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`${uuid()}, ![:Person](${loginUser.rcId})`, topTeam, otherUser);

    await h(t).glip(loginUser).updateProfile({
      favorite_post_ids: [+postId]
    });
    await h(t).glip(loginUser).clearAllUmi();
  });

  const app = new AppRoot(t);
  const teamSection = app.homePage.messageTab.teamsSection;
  const mentionPage = app.homePage.messageTab.mentionPage;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const searchDialog = app.homePage.searchDialog;

  // Login -> Last open DM conversation B: "${beCheckName}"
  await h(t).withLog(`And I set lost open conversation is conversation B: "${topTeam.name}"  before login`, async () => {
    await h(t).glip(loginUser).setLastGroupId(topTeam.glipId);
  });

  await h(t).withLog(`When I login with extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionOnTop(topTeam.glipId, topTeam.name);

  // open via mentions
  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation B: "${topTeam.name}"`, async () => {
    await app.homePage.messageTab.mentionsEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await mentionPage.postItemById(postId).hoverPostAndClickJumpToConversationButton();
  });

  await stepsToCheckPositionOnTop(topTeam.glipId, topTeam.name);

  // open via bookmark
  await h(t).withLog(`Given I the conversation B: "${topTeam.name}" is out of list (not close)`, async () => {
    for (const chatId of privateChatInListIds) {
      await h(t).platform(loginUser).sendTextPost(uuid(), chatId);
      await t.expect(teamSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 });
      await teamSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
    await t.expect(teamSection.conversationEntryById(topTeam.glipId).exists).notOk();
  });

  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation B: "${topTeam.name}"`, async () => {
    await app.homePage.messageTab.bookmarksEntry.enter();
    await bookmarkPage.waitUntilPostsBeLoaded();
    await bookmarkPage.postItemById(postId).hoverPostAndClickJumpToConversationButton();
  });

  await stepsToCheckPositionOnTop(topTeam.glipId, topTeam.name);

  // open via URL
  await h(t).withLog(`Given I the conversation B: "${topTeam.name}" is out of list (not close)`, async () => {
    for (const chatId of privateChatInListIds) {
      await h(t).platform(loginUser).sendTextPost(uuid(), chatId);
      await t.expect(teamSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 });
      await teamSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
  });

  await h(t).withLog(`When I open conversation B: "${topTeam.name}" via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.origin}/messages/${topTeam.glipId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionOnTop(topTeam.glipId, topTeam.name);

  // open via search team name
  await h(t).withLog(`Given I the conversation B: "${topTeam.name}" is out of list (not close)`, async () => {
    for (const chatId of privateChatInListIds) {
      await h(t).platform(loginUser).sendTextPost(uuid(), chatId);
      await t.expect(teamSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 });
      await teamSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
    await t.expect(teamSection.conversationEntryById(topTeam.glipId).exists).notOk();
  });;

  await h(t).withLog(`When I search "${topTeam.name}" and click it`, async () => {
    await app.homePage.header.searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(topTeam.name);
    await t.expect(searchDialog.instantPage.conversationItems.count).gte(1);
    await searchDialog.instantPage.nthTeam(0).enter();
  });

  await stepsToCheckPositionOnTop(topTeam.glipId, topTeam.name);

  // open via create new team
  const createTeamModal = app.homePage.createTeamModal;
  const newTeamName = uuid();
  await h(t).withLog('When I create via "add Action Menu" entry', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
    await createTeamModal.typeTeamName(newTeamName);
    await createTeamModal.clickCreateButton();
  });

  await h(t).withLog(`Then ${newTeamName} should be opened and on the top in team section`, async () => {
    await t.expect(conversationPage.title.textContent).eql(newTeamName);
    await teamSection.nthConversationEntry(0).nameShouldBe(newTeamName);
  });

  await h(t).withLog(`When I refresh page`, async () => {
    await h(t).reload();
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`Then ${newTeamName} should be still on the top in team section`, async () => {
    await t.expect(conversationPage.title.textContent).eql(newTeamName);
    await teamSection.nthConversationEntry(0).nameShouldBe(newTeamName);
  });

  async function stepsToCheckPositionOnTop(chatId: string, teamName: string) {
    await h(t).withLog(`Then ${teamName} should be on the top in teams section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await teamSection.nthConversationEntry(0).groupIdShouldBe(chatId);
      await conversationPage.waitUntilPostsBeLoaded();
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then ${teamName} should be still opened and on the top in teams section`, async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await conversationPage.groupIdShouldBe(chatId);
      await teamSection.nthConversationEntry(0).groupIdShouldBe(chatId);
    });
  }
});


// skip due to bug: https://jira.ringcentral.com/browse/FIJI-3278
test.skip.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-563'],
  maintainers: ['potar.he'],
  keywords: ['ConversationList', 'search'],
})('Should display in the top when open a closed conversation from URL', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[7];
  const otherUser = users[5];
  await h(t).glip(loginUser).init();

  const otherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', otherUser.rcId);

  let topChat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let chat1 = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[1]]
  }
  let chat2 = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[2]]
  }
  let chat3 = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[3]]
  }

  await h(t).withLog(`Given I have directMessage conversation A: "${otherUserName}" and other directMessage conversations`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([topChat, chat1, chat2, chat3])
  })

  let postId;
  await h(t).withLog(`And conversation A: "${otherUserName}" with mention and bookmark post`, async () => {
    postId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `${uuid()}, ![:Person](${loginUser.rcId})`,
      topChat.glipId
    );
    await h(t).glip(loginUser).updateProfile({
      favorite_post_ids: [+postId]
    });
    await h(t).glip(loginUser).clearAllUmi();
    await h(t).glip(loginUser).skipCloseConversationConfirmation(true);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const mentionPageEntry = app.homePage.messageTab.mentionsEntry;
  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const searchDialog = app.homePage.searchDialog;
  const moreMenu = app.homePage.messageTab.moreMenu;

  // open via mentions
  await h(t).withLog(`And I close the conversation A: "${otherUserName}":`, async () => {
    await directMessagesSection.conversationEntryById(topChat.glipId).enter();
    await directMessagesSection.conversationEntryById(topChat.glipId).openMoreMenu();
    await moreMenu.close.enter();
  });

  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation A: "${otherUserName}"`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await mentionPage.postItemById(postId).hoverPostAndClickJumpToConversationButton();
  });

  await stepsToCheckPositionOnTop(topChat.glipId, otherUserName);

  // open via bookmark
  await h(t).withLog(`Given I close the conversation A: "${otherUserName}"`, async () => {
    await directMessagesSection.conversationEntryById(topChat.glipId).openMoreMenu();
    await moreMenu.close.enter();
  });

  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation A: "${otherUserName}"`, async () => {
    await bookmarkEntry.enter();
    await bookmarkPage.waitUntilPostsBeLoaded();
    await bookmarkPage.postItemById(postId).hoverPostAndClickJumpToConversationButton();
  });

  await stepsToCheckPositionOnTop(topChat.glipId, otherUserName);

  // open via search other user name
  await h(t).withLog(`Given I close the conversation A: "${otherUserName}"`, async () => {
    await directMessagesSection.conversationEntryById(topChat.glipId).openMoreMenu();
    await moreMenu.close.enter();
  });

  await h(t).withLog(`When I search the hide privateChat ${otherUserName} and enter it`, async () => {
    await app.homePage.header.searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(otherUserName);
    await t.expect(searchDialog.instantPage.peoples.count).gte(1, { timeout: 10e3 });
    await searchDialog.instantPage.nthPeople(0).enter();
    await app.homePage.profileDialog.ensureLoaded();
    await app.homePage.profileDialog.goToMessages();
  });

  await stepsToCheckPositionOnTop(topChat.glipId, otherUserName);

  // open via send new message entry
  await h(t).withLog(`Given I close the conversation A: "${otherUserName}"`, async () => {
    await directMessagesSection.conversationEntryById(topChat.glipId).openMoreMenu();
    await moreMenu.close.enter();
  });

  const sendNewMessageModal = app.homePage.sendNewMessageModal;
  await h(t).withLog('When I click "Send New Message" on AddActionMenu', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.sendNewMessageEntry.enter();
    await sendNewMessageModal.ensureLoaded();
    await sendNewMessageModal.memberInput.typeText(otherUserName);
    await sendNewMessageModal.memberInput.selectMemberByNth(0);
  });

  await stepsToCheckPositionOnTop(topChat.glipId, otherUserName);

  // open via URL
  await h(t).withLog(`Given I close the conversation A: "${otherUserName}"`, async () => {
    await directMessagesSection.conversationEntryById(topChat.glipId).enter();
    await directMessagesSection.conversationEntryById(topChat.glipId).openMoreMenu();
    await moreMenu.close.enter();
  });

  await h(t).withLog(`When I open conversation A: "${otherUserName}" via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.origin}/messages/${topChat.glipId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionOnTop(topChat.glipId, otherUserName);

  async function stepsToCheckPositionOnTop(chatId: string, teamName: string) {
    await h(t).withLog(`Then ${teamName} should be on the top in DirectMessage section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await directMessagesSection.nthConversationEntry(0).groupIdShouldBe(chatId);
      await conversationPage.waitUntilPostsBeLoaded();
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then ${teamName} should be still opened and on the top in DirectMessage section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await directMessagesSection.nthConversationEntry(0).groupIdShouldBe(chatId);
    });
  }

});