import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Bookmarks/Bookmarks')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Jump to post position when click button or clickable area of post.', ['P1', 'JPT-315', 'zack']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    const otherUser = users[5];

    const conversationPage = app.homePage.messageTab.conversationPage;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const dmSection = app.homePage.messageTab.directMessagesSection;
    const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
    const bookmarkPage = app.homePage.messageTab.bookmarkPage;

    let verifyTextTeam = 'First Bookmarks in Team';
    let verifyTextChat = 'First Bookmarks in pvChat';

    let teamId, pvChatId, bookmarksPostTeamId, bookmarksPostChatId;
    await h(t).withLog('Given I have 1 Bookmarks post in team ,one in group', async () => {
      await h(t).platform(loginUser).init();
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [loginUser.rcId, otherUser.rcId, users[6].rcId],
      });


      pvChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat',
        members: [loginUser.rcId, otherUser.rcId],
      });

      await h(t).glip(loginUser).init();
      await h(t).glip(loginUser).showGroups(loginUser.rcId, [pvChatId, teamId]);
      await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();

      await h(t).platform(otherUser).init();
      bookmarksPostTeamId = await h(t).platform(otherUser).sentAndGetTextPostId(
        verifyTextTeam + `, (${loginUser.rcId})`,
        teamId,
      );
      bookmarksPostChatId = await h(t).platform(otherUser).sentAndGetTextPostId(
        verifyTextChat + `, (${loginUser.rcId})`,
        pvChatId,
      );

    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('And I enter the team conversation page', async () => {

      await teamsSection.expand();
      await teamsSection.conversationEntryById(teamId).enter();
    });

    await h(t).withLog('And I bookmark the team post', async () => {
      await conversationPage.postItemById(bookmarksPostTeamId).clickBookmarkToggle();
    });

    await h(t).withLog('When I go to Bookmarks page', async () => {
      await bookmarksEntry.enter();
    });

    await h(t).withLog('And I click the Bookmarks post item then jump to pvTeam', async () => {
      await bookmarkPage.postItemById(bookmarksPostTeamId).clickConversationByButton();
    });

    await h(t).withLog('Then I can see the Bookmarks post in the pvTeam', async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await t
        .expect(conversationPage.postItemById(bookmarksPostTeamId).body.withText(verifyTextTeam).exists)
        .ok({ timeout: 5e3 });
    });

    await h(t).withLog('When I enter the team conversation page', async () => {
      await dmSection.expand();
      await dmSection.conversationEntryById(pvChatId).enter();
    });

    await h(t).withLog('And I bookmark the DM post', async () => {
      await t.wait(3e3);
      await conversationPage.postItemById(bookmarksPostChatId).clickBookmarkToggle();
    });

    await h(t).withLog('When I back to Bookmarks page', async () => {
      await bookmarksEntry.enter();
    });

    await h(t).withLog('And I click the Bookmarks post item then jump to pvChat', async () => {
      await bookmarkPage.postItemById(bookmarksPostChatId).jumpToConversationByClickName();
    });

    await h(t).withLog('Then I can see the Bookmarks post in the pvChat', async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await t
        .expect(conversationPage.postItemById(bookmarksPostChatId).body.withText(verifyTextChat).exists)
        .ok({ timeout: 5e3 });
    });
  });

test(formalName('Remove UMI when jump to conversation which have unread messages.', ['P2', 'JPT-380', 'zack']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    const otherUser =users[5];
    await h(t).resetGlipAccount(loginUser);

    const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
    const postListPage = app.homePage.messageTab.postListPage;
    const conversationPage = app.homePage.messageTab.conversationPage;
    const bookmarkPage = app.homePage.messageTab.bookmarkPage;
    const dmSection = app.homePage.messageTab.directMessagesSection;
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let groupId;
    await h(t).withLog('Given I have an only one group and the group should not be hidden', async () => {
      await h(t).platform(loginUser).init(); 
      groupId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group', members: [loginUser.rcId, users[5].rcId],
      });
      await h(t).glip(loginUser).init();
      await h(t).glip(loginUser).showGroups(loginUser.rcId, groupId);
    });

    let bookmarkPostId;
    await h(t).withLog('And I have a post', async () => {
      await h(t).platform(otherUser).init(); 
      bookmarkPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
        `Hi I'm Bookmarks, (${loginUser.rcId})`,
        groupId,
      );
    }, true);

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`And I jump to the specific conversation`, async () => {
      await dmSection.expand();
      await dmSection.conversationEntryById(groupId).enter();
    });

    await h(t).withLog('And I bookmark the post', async () => {
      await conversationPage.postItemById(bookmarkPostId).clickBookmarkToggle();
    });

    await h(t).withLog('Then I enter Bookmark page and find the Bookmark posts', async () => {
      await bookmarksEntry.enter();
      await t.expect(postListPage.find('[data-name="conversation-card"]').count).eql(1);
    }, true);

    await h(t).withLog('And I recieve a new post', async () => {
      await h(t).platform(otherUser).createPost(
        { text: `Hi I'm UMI, (${loginUser.rcId})` },
        groupId,
      );
    });

    await h(t).withLog('Then the UMI should exist', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.expectHeaderUmi(1);
    })

    await h(t).withLog('When I click the post and jump to the conversation', async () => {
      await bookmarkPage.postItemById(bookmarkPostId).jumpToConversationByClickPost();
    });

    await h(t).withLog('And the UMI should dismiss', async () => {
      await directMessagesSection.expectHeaderUmi(0);
    }, true);

    await h(t).withLog('Then I nagivate away from conversation and refresh browser', async () => {
      await bookmarksEntry.enter();
      await h(t).refresh();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the UMI count should still no UMI', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.expectHeaderUmi(0);
    }, true);
  });

test(formalName('Show UMI when receive new messages after jump to conversation.', ['P2', 'JPT-384', 'zack']), async (t: TestController) => {
  if (await H.isEdge()) {
    await h(t).log('Skip: This case is not working on Edge due to a Testcafe bug (FIJI-1758)');
    return;
  }

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).resetGlipAccount(loginUser);
  await h(t).platform(loginUser).init();
  await h(t).platform(otherUser).init();
  const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const dmSection = app.homePage.messageTab.directMessagesSection;
  const conversationPage = app.homePage.messageTab.conversationPage;

  const msgList = _.range(20).map(i => `${i} ${uuid()}`);

  let groupId, bookmarkPostId;
  await h(t).withLog('Given I have an AtMention message from the conversation', async () => {
    groupId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Group', members: [loginUser.rcId, users[5].rcId],
    });
    await h(t).glip(loginUser).showGroups(loginUser.rcId, groupId);
    bookmarkPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `I'm Bookmarks, ![:Person](${loginUser.rcId})`,
      groupId,
    );
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I jump to the specific conversation`, async () => {
    await dmSection.expand();
    await dmSection.conversationEntryById(groupId).enter();
  });

  await h(t).withLog('And I bookmark the post', async () => {
    await conversationPage.postItemById(bookmarkPostId).clickBookmarkToggle();
  });

  await h(t).withLog('Then I send 20 messages in conversation', async () => {
    for (const msg of msgList) {
      await h(t).platform(loginUser).createPost({ text: msg }, groupId);
      await t.wait(1e3)
    }
  });

  // await h(t).withLog('And clear all UMI', async () => {
  //   await conversationPage.scrollToBottom();
  //   await dmSection.expectHeaderUmi(0);
  // });

  await h(t).withLog('Then I enter Bookmark page and find the Bookmark posts', async () => {
    await bookmarksEntry.enter();
    await dmSection.expectHeaderUmi(0);
  });

  await h(t).withLog('And I jump to conversation from Bookmarks page should no UMI', async () => {
    await bookmarkPage.postItemById(bookmarkPostId).jumpToConversationByClickPost();
    await dmSection.expectHeaderUmi(0);
  }, true);

  await h(t).withLog('Then I received new AtMention post should 1 UMI', async () => {
    await h(t).platform(otherUser).createPost(
      { text: `Just for UMI, ![:Person](${loginUser.rcId})` },
      groupId,
    );
    await dmSection.fold();
    await dmSection.expectHeaderUmi(1);
  });

  await h(t).withLog('And I scroll to middle should still 1 UMI', async () => {
    await conversationPage.scrollToMiddle();
    await dmSection.expectHeaderUmi(1);
  }, true);

  await h(t).withLog('When I scroll to conversation bottom should remove UMI', async () => {
    await conversationPage.scrollToBottom();
    await dmSection.expectHeaderUmi(0);
  });
});
