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

  const teamSection = app.homePage.messageTab.teamsSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const mentionPageEntry = app.homePage.messageTab.mentionsEntry;
  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;


  let teamId, directMessageChatId, teamMentionPostId, directMessageMentionPostId;
  await h(t).withLog(`Given I have Team conversation A (with mention and bookmark post) exists and in the position 2 in the Team section`, async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: secondTeamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
    teamMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `${uuid()}, ![:Person](${loginUser.rcId})`,
      teamId
    );
    const firstTeamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
    await h(t).platform(otherUser).sendTextPost(
      uuid(),
      firstTeamId
    );
  })

  await h(t).withLog(`And directMessage conversation B (with mention and bookmark post) exists in the position 2 in the DirectMessage section`, async () => {
    directMessageChatId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[5].rcId],
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

  async function nextSteps(section, chatId: string, teamName: string, sectionName: string) {
    await h(t).withLog(`Then ${teamName} should keep its position 2 in ${sectionName} section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await section.nthConversationEntry(1).groupIdShouldBe(chatId);
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).refresh();
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

  await nextSteps(teamSection, teamId, 'conversation A', 'team');

  // open via mentions
  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation A`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await mentionPage.postItemById(teamMentionPostId).jumpToConversationByClickPost();
  });

  await nextSteps(teamSection, teamId, 'conversation A', 'team');

  // open via bookmark
  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation A`, async () => {
    await bookmarkEntry.enter();
    await bookmarkPage.waitUntilPostsBeLoaded();
    await bookmarkPage.postItemById(teamMentionPostId).jumpToConversationByClickPost();
  });

  await nextSteps(teamSection, teamId, 'conversation A', 'team');

  // open via URL
  await h(t).withLog(`When I open conversation A via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.protocol}//${url.hostname}/messages/${teamId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await nextSteps(teamSection, teamId, 'conversation A', 'team');

  // Login -> Last open DM conversation B
  await h(t).withLog(`When I logout And set last_group_id is id of conversation B and login again`, async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.clickLogout();
    await h(t).glip(loginUser).setLastGroupId(directMessageChatId);
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await nextSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via mentions
  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation B`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await mentionPage.postItemById(directMessageMentionPostId).jumpToConversationByClickPost();
  });

  await nextSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via bookmark
  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation B`, async () => {
    await bookmarkEntry.enter();
    await bookmarkPage.waitUntilPostsBeLoaded();
    await bookmarkPage.postItemById(directMessageMentionPostId).jumpToConversationByClickPost();
  });

  await nextSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via URL
  await h(t).withLog(`When I open conversation B via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.protocol}//${url.hostname}/messages/${directMessageChatId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await nextSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');
});



test(formalName('Should display in the top of conversation list when opening a conversation from URL and it is out of the left list', ['P2', 'JPT-463', 'Potar.He', 'ConversationList',]), async (t: TestController) => {
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

  let teamId, directMessageChatId, teamMentionPostId, directMessageMentionPostId;
  await h(t).withLog(`Given I have Team conversation A (with mention and bookmark post) and out `, async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: topTeamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
    teamMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `${uuid()}, ![:Person](${loginUser.rcId})`,
      teamId
    );
    await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
    await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });

    await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });

  })

  await h(t).withLog(`And directMessage conversation B (with mention and bookmark post), and out of list`, async () => {
    directMessageChatId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[5].rcId],
    });
    await h(t).glip(loginUser).hideGroups(directMessageChatId); // hide first then show for pre condition of last group
    await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[0].rcId],
    });

    await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[1].rcId],
    });

    await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[2].rcId],
    });

    directMessageMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `${uuid()}, ![:Person](${loginUser.rcId})`,
      directMessageChatId
    );
    await h(t).glip(loginUser).updateProfile({
      favorite_post_ids: [+teamMentionPostId, +directMessageMentionPostId]
    });
    await h(t).glip(loginUser).clearAllUmi();
  });

  async function nextSteps(section, chatId: string, teamName: string, sectionName: string) {
    await h(t).withLog(`Then ${teamName} should be on the top in ${sectionName} section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await section.nthConversationEntry(0).groupIdShouldBe(chatId);
      await t.wait(5e3); // wait for back-end sync last-group-id
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).refresh();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then ${teamName} should be still opened and on the top in ${sectionName} section`, async () => {
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

  await nextSteps(teamSection, teamId, 'conversation A', 'team');

  // open via mentions
  await h(t).withLog(`Given I hide the conversation A`, async () => {
    await h(t).glip(loginUser).hideGroups([+teamId]);
  });

  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation A`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await mentionPage.postItemById(teamMentionPostId).jumpToConversationByClickPost();
  });

  await nextSteps(teamSection, teamId, 'conversation A', 'team');

  // open via bookmark
  await h(t).withLog(`Given I hide the conversation A`, async () => {
    await h(t).glip(loginUser).hideGroups([+teamId]);
  });

  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation A`, async () => {
    await bookmarkEntry.enter();
    await bookmarkPage.waitUntilPostsBeLoaded();
    await bookmarkPage.postItemById(teamMentionPostId).jumpToConversationByClickPost();
  });

  await nextSteps(teamSection, teamId, 'conversation A', 'team');


  // open via URL
  await h(t).withLog(`When I open conversation A via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.protocol}//${url.hostname}/messages/${teamId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await nextSteps(teamSection, teamId, 'conversation A', 'team');

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
    await h(t).refresh();
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
    await h(t).glip(loginUser).showGroups(directMessageChatId); // set show again for open last group test
    await h(t).glip(loginUser).setLastGroupId(directMessageChatId);
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await nextSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via mentions
  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation B`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await mentionPage.postItemById(directMessageMentionPostId).jumpToConversationByClickPost();
  });

  await nextSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via bookmark
  await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation B`, async () => {
    await bookmarkEntry.enter();
    await bookmarkPage.waitUntilPostsBeLoaded();
    await bookmarkPage.postItemById(directMessageMentionPostId).jumpToConversationByClickPost();
  });

  await nextSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via URL
  await h(t).withLog(`Given I hide the conversation A`, async () => {
    await h(t).glip(loginUser).hideGroups([+teamId]);
  });

  await h(t).withLog(`When I open conversation B via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.protocol}//${url.hostname}/messages/${directMessageChatId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await nextSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

  // open via send new message entry
  await h(t).withLog(`Given I hide the conversation A`, async () => {
    await h(t).glip(loginUser).hideGroups([+directMessageChatId]);
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

  await nextSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage');

});

test(formalName('Should display in the top of conversation list when searching whether it is out of the left list or not', ['P2', 'JPT-968', 'Potar.He', 'ConversationList',]), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[7];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();

  const showedTeamName = uuid();
  const hidedTeamName = uuid();
  const showedChatName = await h(t).glip(loginUser).getPersonPartialData("display_name", users[5].rcId);
  const hidedChatName = await h(t).glip(loginUser).getPersonPartialData("display_name", users[6].rcId);

  const teamSection = app.homePage.messageTab.teamsSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const search = app.homePage.header.search;


  let showedTeamId, hideTeamId;
  await h(t).withLog(`Given I have one showed team and one hided team`, async () => {
    showedTeamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: showedTeamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });

    hideTeamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: hidedTeamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
    await h(t).glip(loginUser).hideGroups(hideTeamId);
  });

  let showedChatId, hidedChatId
  await h(t).withLog(`one showed private chat and one hided private chat`, async () => {
    showedChatId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[5].rcId],
    });

    hidedChatId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[6].rcId],
    });
    await h(t).glip(loginUser).hideGroups(hideTeamId);
  })

  const duplicateSteps = async (section, chatId, teamName, sectionName, cb: () => Promise<any>) => {
    await cb();

    await h(t).withLog(`Then ${teamName} should be on the top in ${sectionName} section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await section.nthConversationEntry(0).groupIdShouldBe(chatId);
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).refresh();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then ${teamName} should be still opened and on the top in ${sectionName} section`, async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await section.nthConversationEntry(0).groupIdShouldBe(chatId);
    });

  }
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // team
  await duplicateSteps(teamSection, showedTeamId, showedTeamName, 'team', async () => {
    await h(t).withLog(`When I search the showed team ${showedTeamName} and click it`, async () => {
      await search.typeText(showedTeamName, { replace: true, paste: true });
      await t.wait(3e3);
      await search.nthTeam(0).enter();
    })
  });

  await duplicateSteps(teamSection, hideTeamId, hidedTeamName, 'team', async () => {
    await h(t).withLog(`When I search the showed team ${hidedTeamName} and click it`, async () => {
      await search.typeText(hidedTeamName, { replace: true, paste: true });
      await t.wait(3e3);
      await search.nthTeam(0).enter();
    })
  });

  // directMessage
  await duplicateSteps(directMessagesSection, showedChatId, showedChatName, 'directMessage', async () => {
    await h(t).withLog(`When I search the showed team ${showedChatName} and click it`, async () => {
      await search.typeText(showedChatName, { replace: true, paste: true });
      await t.wait(3e3);
      await search.nthPeople(0).enter();
    })
  });

  await duplicateSteps(directMessagesSection, hidedChatId, hidedChatName, 'directMessage', async () => {
    await h(t).withLog(`When I search the showed team ${hidedChatName} and click it`, async () => {
      await search.typeText(hidedChatName, { replace: true, paste: true });
      await t.wait(3e3);
      await search.nthPeople(0).enter();
    })
  });
});