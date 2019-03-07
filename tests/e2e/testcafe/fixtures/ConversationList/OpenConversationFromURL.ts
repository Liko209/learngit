/*
 * @Author: Potar (Potar.He@ringcentral.com)
 * @Date: 2018-01-16 17:16:38
 * Copyright © RingCentral. All rights reserved.
 */
import * as uuid from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('ConversationList/TeamSection')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Should keep its position in the conversation list and NOT be moved to the top of the list when the conversation exists in the left list', ['P2', 'JPT-872', 'Potar.He', 'ConversationList',]), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[7];
  const otherUser = users[5];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();
  const secondTeamName = `second-${uuid()}`;
  const otherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', otherUser.rcId);

  const teamSection = app.homePage.messageTab.teamsSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const mentionPageEntry = app.homePage.messageTab.mentionsEntry;
  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const search = app.homePage.header.search;



  let teamId, directMessageChatId, teamMentionPostId, directMessageMentionPostId;
  await h(t).withLog(`Given I have Team conversation A (with mention and bookmark post) exists and in the position 2 in the Team section`, async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: secondTeamName,
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId],
    });
    teamMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `${uuid()}, ![:Person](${loginUser.rcId})`,
      teamId
    );
    const firstTeamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId],
    });
    await h(t).platform(otherUser).sendTextPost(
      uuid(),
      firstTeamId
    );
  })

  await h(t).withLog(`And directMessage conversation B (with mention and bookmark post) exists in the position 2 in the DirectMessage section`, async () => {
    directMessageChatId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, otherUser.rcId],
    });
    const firstDMId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[6].rcId],
    });
    directMessageMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `${uuid()}, ![:Person](${loginUser.rcId})`,
      directMessageChatId
    );
    await h(t).platform(loginUser).sendTextPost(
      uuid(),
      firstDMId
    );
    await h(t).glip(loginUser).updateProfile({
      favorite_post_ids: [+teamMentionPostId, +directMessageMentionPostId]
    });
    await h(t).glip(loginUser).clearAllUmi();
  });

  async function stepsToCheckPositionFixed(section, chatId: string, teamName: string, sectionName: string) {
    await h(t).withLog(`Then ${teamName} should keep its position 2 in ${sectionName} section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await section.nthConversationEntry(1).groupIdShouldBe(chatId);
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then ${teamName} should keep its position 2 ${sectionName} section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await section.nthConversationEntry(1).groupIdShouldBe(chatId);
    });
  }

  // 1. Login -> Last open team conversation A
  await h(t).withLog(`And set last_group_id is id of ${secondTeamName}`, async () => {
    await h(t).glip(loginUser).setLastGroupId(teamId);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionFixed(teamSection, teamId, 'conversation A', 'team');

  // open via mentions
  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation A`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.postItemById(teamMentionPostId).jumpToConversationByClickPost();
  });

  await stepsToCheckPositionFixed(teamSection, teamId, 'conversation A', 'team');

  // open via bookmark
  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation A`, async () => {
    await bookmarkEntry.enter();
    await bookmarkPage.postItemById(teamMentionPostId).jumpToConversationByClickPost();
  });

  await stepsToCheckPositionFixed(teamSection, teamId, 'conversation A', 'team');

  // open via URL
  await h(t).withLog(`When I open conversation A via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.protocol}//${url.hostname}/messages/${teamId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionFixed(teamSection, teamId, 'conversation A', 'team');

  // open via search team name
  await h(t).withLog(`When I search the showed team ${secondTeamName} and click it`, async () => {
    await search.typeSearchKeyword(secondTeamName, { replace: true, paste: true });
    await t.wait(3e3);
    await search.nthTeam(0).enter();
  });

  await stepsToCheckPositionFixed(teamSection, teamId, 'conversation A', 'team');

  // Login -> Last open DM conversation B
  await h(t).withLog(`When I logout And set last_group_id is id of conversation B and login again`, async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.clickLogout();
    await h(t).glip(loginUser).setLastGroupId(directMessageChatId);
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionFixed(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via mentions
  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation B`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.postItemById(directMessageMentionPostId).jumpToConversationByClickPost();
  });

  await stepsToCheckPositionFixed(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via bookmark
  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation B`, async () => {
    await bookmarkEntry.enter();
    await bookmarkPage.postItemById(directMessageMentionPostId).jumpToConversationByClickPost();
  });

  await stepsToCheckPositionFixed(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via URL
  await h(t).withLog(`When I open conversation B via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.protocol}//${url.hostname}/messages/${directMessageChatId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionFixed(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via search other user name
  await h(t).withLog(`When I search the showed privateChat ${otherUserName} and click it`, async () => {
    await search.typeSearchKeyword(otherUserName, { replace: true, paste: true });
    await t.wait(3e3);
    await search.nthPeople(0).enter();
  });

  await stepsToCheckPositionFixed(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');
});


// bug: https://jira.ringcentral.com/browse/FIJI-3278
test(formalName('Should display in the top of conversation list when opening a conversation and it is out of the left list', ['P2', 'JPT-463', 'Potar.He', 'ConversationList',]), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[7];
  const otherUser = users[5];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();
  await h(t).glip(loginUser).setMaxTeamDisplay(3); // if use hide group, no show last Group

  const beCheckName = await h(t).glip(loginUser).getPerson(otherUser.rcId).then(res => res.data.display_name);

  const teamSection = app.homePage.messageTab.teamsSection;
  const mentionPageEntry = app.homePage.messageTab.mentionsEntry;
  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const search = app.homePage.header.search;

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
  await h(t).withLog(`Given team conversation B: "${beCheckName}" and some private chats`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([topTeam, team1, team2, team3]);
    privateChatInListIds = [team1.glipId, team2.glipId, team3.glipId];
  });

  let postId;
  await h(t).withLog(`And B with at mention and bookmark post and clear all umi`, async () => {
    postId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `${uuid()}, ![:Person](${loginUser.rcId})`,
      topTeam.glipId
    );

    await h(t).glip(loginUser).updateProfile({
      favorite_post_ids: [+postId]
    });
    await h(t).glip(loginUser).clearAllUmi();
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

  // Login -> Last open DM conversation B: "${beCheckName}"
  await h(t).withLog(`When I logout And set last_group_id is id of conversation B: "${beCheckName}" and login again`, async () => {
    await h(t).glip(loginUser).setLastGroupId(topTeam.glipId);
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionOnTop(topTeam.glipId, beCheckName);

  // open via mentions
  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation B: "${beCheckName}"`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await mentionPage.postItemById(postId).jumpToConversationByClickPost();
  });

  await stepsToCheckPositionOnTop(topTeam.glipId, beCheckName);

  // open via bookmark
  await h(t).withLog(`Given I the conversation B: "${beCheckName}" is out of list (not close)`, async () => {
    for (const chatId of privateChatInListIds) {
      await h(t).platform(loginUser).sendTextPost(uuid(), chatId);
      await t.expect(teamSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 });
      await teamSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
    await t.expect(teamSection.conversationEntryById(topTeam.glipId).exists).notOk();
  });

  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation B: "${beCheckName}"`, async () => {
    await bookmarkEntry.enter();
    await bookmarkPage.waitUntilPostsBeLoaded();
    await bookmarkPage.postItemById(postId).jumpToConversationByClickPost();
  });

  await stepsToCheckPositionOnTop(topTeam.glipId, beCheckName);


  // open via URL
  await h(t).withLog(`Given I the conversation B: "${beCheckName}" is out of list (not close)`, async () => {
    for (const chatId of privateChatInListIds) {
      await h(t).platform(loginUser).sendTextPost(uuid(), chatId);
      await t.expect(teamSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 });
      await teamSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
  });

  await h(t).withLog(`When I open conversation B: "${beCheckName}" via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.protocol}//${url.hostname}/messages/${topTeam.glipId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionOnTop(topTeam.glipId, beCheckName);

  // open via search other user name
  await h(t).withLog(`Given I the conversation B: "${beCheckName}" is out of list (not close)`, async () => {
    for (const chatId of privateChatInListIds) {
      await h(t).platform(loginUser).sendTextPost(uuid(), chatId);
      await t.expect(teamSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 });
      await teamSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
    await t.expect(teamSection.conversationEntryById(topTeam.glipId).exists).notOk();
  });;

  await h(t).withLog(`When I search the hide privateChat ${beCheckName} and click it`, async () => {
    await search.typeSearchKeyword(beCheckName, { replace: true, paste: true });
    await t.expect(search.allResultItems.count).gte(1);
    await search.nthPeople(0).enter();
  });

  await stepsToCheckPositionOnTop(topTeam.glipId, beCheckName);

  // open via send new message entry
  const createTeamModal = app.homePage.createTeamModal;

  // open via create new team
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
});
