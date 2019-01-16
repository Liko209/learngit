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
  await h(t).resetGlipAccount(loginUser);
  await h(t).glip(loginUser).init();
  const secondTeamName = `second-${uuid()}`;
  const otherUserName = await h(t).glip(loginUser).getPerson(otherUser.rcId).then(res => res.data.display_name);

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
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
    teamMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(`${uuid}, ![:Person](${loginUser.rcId})`, teamId);
    await h(t).platform(loginUser).createGroup({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[6].rcId],
    });
  })

  await h(t).withLog(`And directMessage conversation B (with mention and bookmark post) exists in the position 2 in the DirectMessage section`, async () => {
    directMessageChatId = await h(t).platform(loginUser).createGroup({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[5].rcId],
    });
    await h(t).platform(loginUser).createGroup({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[6].rcId],
    });

    directMessageMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(`${uuid}, ![:Person](${loginUser.rcId})`, directMessageChatId);
    await h(t).glip(loginUser).updateProfile({
      favorite_post_ids: [+teamMentionPostId, +directMessageMentionPostId]
    });
    await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();
  });

  const duplicateSteps = async (section, chatId, teamName, sectionName, cb: () => Promise<any>) => {
    await cb();

    await h(t).withLog(`Then ${teamName} should keep its position 2 in ${sectionName} section`, async () => {
      conversationPage.groupIdShouldBe(chatId);
      await section.nthConversationEntry(1).groupIdShouldBe(chatId);
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).refresh();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then ${teamName} should keep its position 2 ${sectionName}`, async () => {
      await section.nthConversationEntry(1).groupIdShouldBe(chatId);
    });
  }

  // 1. Login -> Last open team conversation A
  await duplicateSteps(teamSection, teamId, 'conversation A', 'team', async () => {
    await h(t).withLog(`And set last_group_id is id of ${secondTeamName}`, async () => {
      await h(t).glip(loginUser).setLastGroupId(teamId);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });
  });

  // open via mentions
  await duplicateSteps(teamSection, teamId, 'conversation A', 'team', async () => {
    await h(t).withLog(`When I open mention page and click mention post which belongs to conversation A`, async () => {
      await mentionPageEntry.enter();
      await mentionPage.waitUntilPostsBeLoaded();
      await mentionPage.postItemById(teamMentionPostId).jumpToConversationByClickPost();
    });
  });

  // open via bookmark
  await duplicateSteps(teamSection, teamId, 'conversation A', 'team', async () => {
    await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation A`, async () => {
      await bookmarkEntry.enter();
      await bookmarkPage.waitUntilPostsBeLoaded();
      await bookmarkPage.postItemById(teamMentionPostId).jumpToConversationByClickPost();
    });
  });

  // open via search 
  const search = app.homePage.header.search;
  await duplicateSteps(teamSection, teamId, 'conversation A', 'team', async () => {
    await h(t).withLog(`When I open conversation A via search entry`, async () => {
      await search.typeText(secondTeamName, { replace: true, paste: true });
      await t.wait(3e3);
      // this is a bug: https://jira.ringcentral.com/browse/FIJI-2500
      await h(t).refresh();
      await app.homePage.ensureLoaded();
      await search.typeText(secondTeamName, { replace: true, paste: true });
      await t.wait(3e3); // wait search result show;
      await search.nthTeam(0).enter();
    });
  });

  // open via URL 
  await duplicateSteps(teamSection, teamId, 'conversation A', 'team', async () => {
    await h(t).withLog(`When I open conversation A via URL `, async () => {
      const url = new URL(SITE_URL)
      const NEW_URL = `${url.protocol}//${url.hostname}/messages/${teamId}`;
      await t.navigateTo(NEW_URL);
      await app.homePage.ensureLoaded();
    });
  });

  // Login -> Last open DM conversation B


  await duplicateSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage', async () => {
    await h(t).withLog(`When I open directMessage conversation B, logout and login again`, async () => {
      await directMessagesSection.nthConversationEntry(1).enter();
      await app.homePage.openSettingMenu();
      await app.homePage.settingMenu.clickLogout();
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });
  });
  // open via mentions


  await duplicateSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage', async () => {
    await h(t).withLog(`When I open mention page and click mention post which belongs to conversation B`, async () => {
      await mentionPageEntry.enter();
      await mentionPage.waitUntilPostsBeLoaded();
      await mentionPage.postItemById(directMessageMentionPostId).jumpToConversationByClickPost();
    });
  });
  // open via bookmark


  await duplicateSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage', async () => {
    await h(t).withLog(`When I open bookmark page and click bookmark post which belongs to conversation B`, async () => {
      await bookmarkEntry.enter();
      await bookmarkPage.waitUntilPostsBeLoaded();
      await bookmarkPage.postItemById(directMessageMentionPostId).jumpToConversationByClickPost();
    });
  });
  // open via search 


  await duplicateSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage', async () => {
    await h(t).withLog(`When I open conversation B via search entry`, async () => {
      await search.typeText(otherUserName, { replace: true, paste: true });
      await t.wait(3e3);
      // this is a bug: https://jira.ringcentral.com/browse/FIJI-2500
      await h(t).refresh();
      await app.homePage.ensureLoaded();
      await search.typeText(otherUserName, { replace: true, paste: true });
      await t.wait(3e3); // wait search result show;
      await search.nthPeople(0).enter();
    });
  });
  // open via URL 

  await duplicateSteps(directMessagesSection, directMessageChatId, 'conversation B', 'directMessage', async () => {
    await h(t).withLog(`When I open conversation B via URL `, async () => {
      const url = new URL(SITE_URL)
      const NEW_URL = `${url.protocol}//${url.hostname}/messages/${directMessageChatId}`;
      await t.navigateTo(NEW_URL);
      await app.homePage.ensureLoaded();
    });

  });
});