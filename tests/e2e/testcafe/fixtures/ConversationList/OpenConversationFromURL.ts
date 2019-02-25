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



test.skip(formalName('Should display in the top of conversation list when opening a conversation from URL and it is out of the left list', ['P2', 'JPT-463', 'Potar.He', 'ConversationList',]), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[7];
  const otherUser = users[5];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();
  await h(t).glip(loginUser).setMaxTeamDisplay(3); // if use hide group, no show last Group

  const topTeamName = `top-${uuid()}`;
  const otherUserName = await h(t).glip(loginUser).getPerson(otherUser.rcId).then(res => res.data.display_name);

  const teamSection = app.homePage.messageTab.teamsSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const mentionPageEntry = app.homePage.messageTab.mentionsEntry;
  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const search = app.homePage.header.search;

  let teamId, directMessageChatId, teamMentionPostId, directMessageMentionPostId;
  let teamInListIds = [];
  await h(t).withLog(`Given I have Team conversation A and some teams`, async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: topTeamName,
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId],
    });

    const teamId1 = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId],
    });
    const teamId2 = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId],
    });

    const teamId3 = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId],
    });

    teamInListIds = [teamId1, teamId2, teamId3];
  })

  let privateChatInListIds = [];
  await h(t).withLog(`And directMessage conversation B and some private chats`, async () => {
    directMessageChatId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, otherUser.rcId],
    });

    const dmId1 = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[0].rcId],
    });

    const dmId2 = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[1].rcId],
    });

    const dmId3 = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[2].rcId],
    });

    privateChatInListIds = [dmId1, dmId2, dmId3];
  });

  await h(t).withLog(`And conversation A and B with at mention and bookmark post and clear all umi`, async () => {
    teamMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `${uuid()}, ![:Person](${loginUser.rcId})`,
      teamId
    );

    directMessageMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `${uuid()}, ![:Person](${loginUser.rcId})`,
      directMessageChatId
    );

    await h(t).glip(loginUser).updateProfile({
      favorite_post_ids: [+teamMentionPostId, +directMessageMentionPostId]
    });
    await h(t).glip(loginUser).clearAllUmi();
  });

  async function stepsToCheckPositionOnTop(section, chatId: string, teamName: string, sectionName: string) {
    await h(t).withLog(`Then ${teamName} should be on the top in ${sectionName} section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await section.nthConversationEntry(0).groupIdShouldBe(chatId);
      await conversationPage.waitUntilPostsBeLoaded();
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then ${teamName} should be still opened and on the top in ${sectionName} section`, async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await conversationPage.groupIdShouldBe(chatId);
      await section.nthConversationEntry(0).groupIdShouldBe(chatId);
    });

  }

  // 1. Login -> Last open team conversation A
  await h(t).withLog(`And set last_group_id is id of ${topTeamName}`, async () => {
    await h(t).glip(loginUser).setMaxTeamDisplay(3);
    await h(t).glip(loginUser).setLastGroupId(teamId);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionOnTop(teamSection, teamId, 'conversation A', 'team');

  // open via mentions
  await h(t).withLog(`Given I the conversation A is out of list (not close)`, async () => {
    for (const chatId of teamInListIds) {
      await h(t).platform(otherUser).sendTextPost(uuid(), chatId);
      await teamSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
    await t.expect(teamSection.conversationEntryById(teamId).exists).notOk();
  });

  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation A`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await mentionPage.postItemById(teamMentionPostId).jumpToConversationByClickPost();

  });

  await stepsToCheckPositionOnTop(teamSection, teamId, 'conversation A', 'team');

  // open via bookmark
  await h(t).withLog(`Given I the conversation A is out of list (not close)`, async () => {
    for (const chatId of teamInListIds) {
      await h(t).platform(otherUser).sendTextPost(uuid(), chatId);
      await teamSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
    await t.expect(teamSection.conversationEntryById(teamId).exists).notOk();
  });

  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation A`, async () => {
    await bookmarkEntry.enter();
    await bookmarkPage.waitUntilPostsBeLoaded();
    await bookmarkPage.postItemById(teamMentionPostId).jumpToConversationByClickPost();
  });

  await stepsToCheckPositionOnTop(teamSection, teamId, 'conversation A', 'team');

  // skip this entry due to a bug: https://jira.ringcentral.com/browse/FIJI-3278
  // open via URL
  await h(t).withLog(`Given I the conversation A is out of list (not close)`, async () => {
    for (const chatId of teamInListIds) {
      await h(t).platform(otherUser).sendTextPost(uuid(), chatId);
      await t.expect(teamSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 })
      await teamSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
  });

  await h(t).withLog(`When I open conversation A via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.protocol}//${url.hostname}/messages/${teamId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionOnTop(teamSection, teamId, 'conversation A', 'team');

  // open via search team name
  await h(t).withLog(`Given I the conversation A is out of list (not close)`, async () => {
    for (const chatId of teamInListIds) {
      await h(t).platform(otherUser).sendTextPost(uuid(), chatId);
      await t.expect(teamSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 })
      await teamSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
    await t.expect(teamSection.conversationEntryById(teamId).exists).notOk();
  });

  await h(t).withLog(`When I search the hide team ${topTeamName} and click it`, async () => {
    await search.typeSearchKeyword(topTeamName, { replace: true, paste: true });
    await t.expect(search.allResultItems.count).gte(1);
    await search.nthTeam(0).enter();
  });

  await stepsToCheckPositionOnTop(teamSection, teamId, 'conversation A', 'team');

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


  // 2. Login -> Last open DM conversation B
  await h(t).withLog(`When I logout And set last_group_id is id of conversation B and login again`, async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.clickLogout();
    await h(t).glip(loginUser).setLastGroupId(directMessageChatId);
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionOnTop(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via mentions
  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation B`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await mentionPage.postItemById(directMessageMentionPostId).jumpToConversationByClickPost();
  });

  await stepsToCheckPositionOnTop(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via bookmark
  await h(t).withLog(`Given I the conversation B is out of list (not close)`, async () => {
    for (const chatId of privateChatInListIds) {
      await h(t).platform(otherUser).sendTextPost(uuid(), chatId);
      await t.expect(directMessagesSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 });
      await directMessagesSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
    await t.expect(directMessagesSection.conversationEntryById(directMessageChatId).exists).notOk();
  });

  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation B`, async () => {
    await bookmarkEntry.enter();
    await bookmarkPage.waitUntilPostsBeLoaded();
    await bookmarkPage.postItemById(directMessageMentionPostId).jumpToConversationByClickPost();
  });

  await stepsToCheckPositionOnTop(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // skip this entry due to a bug: https://jira.ringcentral.com/browse/FIJI-3278
  // open via URL
  await h(t).withLog(`Given I the conversation B is out of list (not close)`, async () => {
    for (const chatId of privateChatInListIds) {
      await h(t).platform(otherUser).sendTextPost(uuid(), chatId);
      await t.expect(directMessagesSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 });
      await directMessagesSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
  });

  await h(t).withLog(`When I open conversation B via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.protocol}//${url.hostname}/messages/${directMessageChatId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionOnTop(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via search other user name
  await h(t).withLog(`Given I the conversation B is out of list (not close)`, async () => {
    for (const chatId of privateChatInListIds) {
      await h(t).platform(otherUser).sendTextPost(uuid(), chatId);
      await t.expect(directMessagesSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 });
      await directMessagesSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
    await t.expect(directMessagesSection.conversationEntryById(directMessageChatId).exists).notOk();
  });;

  await h(t).withLog(`When I search the hide privateChat ${otherUserName} and click it`, async () => {
    await search.typeSearchKeyword(otherUserName, { replace: true, paste: true });
    await t.expect(search.allResultItems.count).gte(1);
    await search.nthPeople(0).enter();
  });

  await stepsToCheckPositionOnTop(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via send new message entry
  await h(t).withLog(`Given I the conversation B is out of list (not close)`, async () => {
    for (const chatId of privateChatInListIds) {
      await h(t).platform(otherUser).sendTextPost(uuid(), chatId);
      await t.expect(directMessagesSection.conversationEntryById(chatId).exists).ok({ timeout: 10e3 });
      await directMessagesSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    }
    await t.expect(directMessagesSection.conversationEntryById(directMessageChatId).exists).notOk();
  });

  await h(t).withLog('When I click "Send New Message" on AddActionMenu', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.sendNewMessageEntry.enter();
    await createTeamModal.ensureLoaded();
    const sendNewMessageModal = app.homePage.sendNewMessageModal;
    await sendNewMessageModal.typeMember(otherUserName, { paste: true });
    await t.wait(3e3);
    await sendNewMessageModal.selectMemberByNth(0);
    await sendNewMessageModal.clickSendButton();
  });

  await stepsToCheckPositionOnTop(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

});
