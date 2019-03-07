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

// requirement changed https://jira.ringcentral.com/browse/FIJI-2491 https://jira.ringcentral.com/browse/FIJI-2267
test(formalName('Should remains where it is when click a conversation in the conversation list.', ['P2', 'JPT-464', 'ConversationList', 'Yilia Hong']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();

    const teamName1 = `Team 1 ${uuid()}`;
    const teamName2 = `Team 2 ${uuid()}`
    const teamsSection = app.homePage.messageTab.teamsSection;

    let teamId;
    await h(t).withLog('Given I have an extension with two conversation', async () => {
      await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: teamName1,
        members: [loginUser.rcId, users[5].rcId],
      });

      await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: teamName2,
        members: [loginUser.rcId, users[6].rcId],
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('When I open the second conversation 2', async () => {
      await teamsSection.expand();
      await teamsSection.nthConversationEntry(-1).enter();
      teamId = await app.homePage.messageTab.conversationPage.currentGroupId;
    });

    await h(t).withLog('Then the conversation 2 still remain in the second', async () => {
      await teamsSection.nthConversationEntry(-1).groupIdShouldBe(teamId);
    });

    await h(t).withLog('When I refresh page', async () => {
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the conversation 2 display in the second', async () => {
      await teamsSection.nthConversationEntry(-1).groupIdShouldBe(teamId);
    });
  },
);

test(formalName('Should display in the top when open a closed conversation from URL', ['P2', 'JPT-563', 'ConversationList', 'Yilia Hong']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[7];
  const otherUser = users[5];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();

  const otherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', otherUser.rcId);

  // const teamSection = app.homePage.messageTab.teamsSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const mentionPageEntry = app.homePage.messageTab.mentionsEntry;
  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const search = app.homePage.header.search;
  const createTeamModal = app.homePage.createTeamModal;
  const moreMenu = app.homePage.messageTab.moreMenu;
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
  let postId;
  await h(t).withLog(`Given I have directMessage conversation A: "${otherUserName}" and other directMessage conversations`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([topChat, chat1, chat2, chat3])
  })

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

  await h(t).withLog(`Given I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  // open via mentions
  await h(t).withLog(`Given I close the conversation A: "${otherUserName}":`, async () => {
    await directMessagesSection.conversationEntryById(topChat.glipId).openMoreMenu();
    await moreMenu.close.enter();
  });

  await h(t).withLog(`When I open mention page and click mention post which belongs to conversation A: "${otherUserName}"`, async () => {
    await mentionPageEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await mentionPage.postItemById(postId).jumpToConversationByClickPost();
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
    await bookmarkPage.postItemById(postId).jumpToConversationByClickPost();
  });

  await stepsToCheckPositionOnTop(topChat.glipId, otherUserName);

  // open via search other user name
  await h(t).withLog(`Given I close the conversation A: "${otherUserName}"`, async () => {
    await directMessagesSection.conversationEntryById(topChat.glipId).openMoreMenu();
    await moreMenu.close.enter();
  });

  await h(t).withLog(`When I search the hide privateChat ${otherUserName} and click it`, async () => {
    await search.typeSearchKeyword(otherUserName, { replace: true, paste: true });
    await t.expect(search.peoples.count).gte(1, { timeout: 10e3 });
    await search.nthPeople(0).enter();
  });

  await stepsToCheckPositionOnTop(topChat.glipId, otherUserName);

  // open via send new message entry
  await h(t).withLog(`Given I close the conversation A: "${otherUserName}"`, async () => {
    await directMessagesSection.conversationEntryById(topChat.glipId).openMoreMenu();
    await moreMenu.close.enter();
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

  await stepsToCheckPositionOnTop(topChat.glipId, otherUserName);

  // skip this entry due to a bug: https://jira.ringcentral.com/browse/FIJI-3278
  // open via URL
  await h(t).withLog(`Given I close the conversation A: "${otherUserName}"`, async () => {
    await directMessagesSection.conversationEntryById(topChat.glipId).openMoreMenu();
    await moreMenu.close.enter();
  });

  await h(t).withLog(`When I open conversation A: "${otherUserName}" via URL `, async () => {
    const url = new URL(SITE_URL)
    const NEW_URL = `${url.protocol}//${url.hostname}/messages/${topChat.glipId}`;
    await t.navigateTo(NEW_URL);
    await app.homePage.ensureLoaded();
  });

  await stepsToCheckPositionOnTop(topChat.glipId, otherUserName);

});

test(formalName('Should not display in conversation list when last conversation was closed', ['P2', 'JPT-566', 'ConversationList', 'Yilia Hong']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    await h(t).platform(user).init();
    await h(t).glip(user).init();
    const teamName = `Team ${uuid()}`;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let teamId;
    await h(t).withLog('Given I have a conversation', async () => {
      teamId = await h(t).platform(user).createAndGetGroupId({
        name: teamName,
        type: 'Team',
        members: [user.rcId, users[5].rcId],
      });
    });

    await h(t).withLog('The conversation should be last conversation', async () => {
      await h(t).glip(user).setLastGroupId(teamId);
    });

    await h(t).withLog('The last conversation should be closed before login', async () => {
      await h(t).glip(user).hideGroups([teamId]);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the conversation should not display in conversation list', async () => {
      await t.expect(teamsSection.conversationEntryById(teamId).exists).notOk();
      const url = new URL(SITE_URL);
      const targetUrl = `${url.protocol}//${url.hostname}/messages/`
      await H.retryUntilPass(async () => {
        const currentUrl = await h(t).href;
        assert.strictEqual(currentUrl, targetUrl, `${currentUrl} is invalid`);
      });
    });
  },
);
