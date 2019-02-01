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

test(formalName('Jump to post position when click button or clickable area of post.', ['P1', 'JPT-315', 'zack', 'Bookmarks']),
  async (t: TestController) => {
    const users = h(t).rcData.mainCompany.users;

    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfile();

    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    const teamBookmarkMessage = `team bookmark message ${uuid()}`;
    const privateChatBookmarkMessage = `private chat bookmark message ${uuid()}`;

    let teamId: string, pvChatId: string, bookmarksPostTeamId: string, bookmarksPostChatId: string;
    await h(t).withLog('Given I have an extension with one Bookmarks post in team and one in group', async () => {
      // ensure have at least one team
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [loginUser.rcId, otherUser.rcId, users[6].rcId],
      });

      // ensure have at least one private chat
      pvChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat',
        members: [loginUser.rcId, otherUser.rcId],
      });

      // using platform sdk to send posts to team and private chat
      bookmarksPostTeamId = await h(t).platform(otherUser).sentAndGetTextPostId(
        teamBookmarkMessage,
        teamId,
      );
      bookmarksPostChatId = await h(t).platform(otherUser).sentAndGetTextPostId(
        privateChatBookmarkMessage,
        pvChatId,
      );
    });

    const app = new AppRoot(t);
    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const teamsSection = app.homePage.messageTab.teamsSection;
    const conversationPage = app.homePage.messageTab.conversationPage;
    await h(t).withLog('And enter the team conversation', async () => {
      await teamsSection.expand();
      await teamsSection.conversationEntryById(teamId).enter();
    });

    await h(t).withLog('And bookmark the post in the team', async () => {
      await conversationPage.postItemById(bookmarksPostTeamId).clickBookmarkToggle();
    });

    const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
    const bookmarkPage = app.homePage.messageTab.bookmarkPage;
    await h(t).withLog('And go to Bookmarks page', async () => {
      await bookmarksEntry.enter();
    });

    await h(t).withLog('Then I should find the bookmarked post', async () => {
      await t.expect(bookmarkPage.postItemById(bookmarksPostTeamId).exists).ok();
    }, true);

    await h(t).withLog('When I click the bookmarked post item', async () => {
      await bookmarkPage.postItemById(bookmarksPostTeamId).clickConversationByButton();
    });

    await h(t).withLog('Then I should find the bookmarked post in the team', async () => {
      await t
        .expect(conversationPage.postItemById(bookmarksPostTeamId).body.withText(teamBookmarkMessage).exists)
        .ok({ timeout: 5e3 });
    }, true);

    const dmSection = app.homePage.messageTab.directMessagesSection;
    await h(t).withLog('When I enter the private chat conversation', async () => {
      await dmSection.expand();
      await dmSection.conversationEntryById(pvChatId).enter();
    });

    await h(t).withLog('And bookmark the post in the private chat', async () => {
      await conversationPage.postItemById(bookmarksPostChatId).clickBookmarkToggle();
    });

    await h(t).withLog('And go back to Bookmarks page', async () => {
      await bookmarksEntry.enter();
    });

    await h(t).withLog('Then I should find the bookmarked post', async () => {
      await t.expect(bookmarkPage.postItemById(bookmarksPostChatId).exists).ok();
    }, true);

    await h(t).withLog('When I click the bookmarked post item', async () => {
      await bookmarkPage.postItemById(bookmarksPostChatId).jumpToConversationByClickName();
    });

    await h(t).withLog('Then I should find the bookmarked post in the private chat', async () => {
      await t
        .expect(conversationPage.postItemById(bookmarksPostChatId).body.withText(privateChatBookmarkMessage).exists)
        .ok({ timeout: 5e3 });
    });
  });


test(formalName('Data in bookmarks page should be dynamically sync.', ['P2', 'JPT-311', 'zack']),
  async (t: TestController) => {

    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).resetGlipAccount(loginUser);
    const otherUser = users[5];
    const conversationPage = app.homePage.messageTab.conversationPage;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
    const bookmarkPage = app.homePage.messageTab.bookmarkPage;

    let teamId, bookmarksPostTeamId1, bookmarksPostTeamId2, bookmarksPostTeamId3;
    await h(t).withLog('Given I have one team and 3 post', async () => {
      await h(t).platform(loginUser).init();
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [loginUser.rcId, otherUser.rcId, users[6].rcId],
      });

      await h(t).glip(loginUser).init();

      await h(t).platform(otherUser).init();

      bookmarksPostTeamId1 = await h(t).platform(otherUser).sentAndGetTextPostId(
        uuid() + `, (${loginUser.rcId})`,
        teamId,
      );
      bookmarksPostTeamId2 = await h(t).platform(otherUser).sentAndGetTextPostId(
        uuid() + `, (${loginUser.rcId})`,
        teamId,
      );
      bookmarksPostTeamId3 = await h(t).platform(otherUser).sentAndGetTextPostId(
        uuid() + `, (${loginUser.rcId})`,
        teamId,
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
      await conversationPage.postItemById(bookmarksPostTeamId1).clickBookmarkToggle();
      await conversationPage.postItemById(bookmarksPostTeamId2).clickBookmarkToggle();
    });

    await h(t).withLog('When I go to Bookmarks page', async () => {
      await bookmarksEntry.enter();
    });

    await h(t).withLog('And I have 2 post in bookmark page', async () => {
      await t.expect(bookmarkPage.posts.count).eql(2);
    });

    await h(t).withLog('When I bookmark 3th post in conversation', async () => {
      await teamsSection.expand();
      await teamsSection.conversationEntryById(teamId).enter();
      await conversationPage.postItemById(bookmarksPostTeamId3).clickBookmarkToggle();
    });

    await h(t).withLog('And I have 3 post in bookmark page', async () => {
      await bookmarksEntry.enter();
      await t.expect(bookmarkPage.posts.count).eql(3);
    });
  })

test(formalName('Remove UMI when jump to conversation which have unread messages.', ['P2', 'JPT-380', 'zack']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    const otherUser = users[5];
    await h(t).resetGlipAccount(loginUser);
    await h(t).glip(loginUser).init();

    const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
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
      await t.expect(bookmarkPage.posts.count).eql(1);
    }, true);

    await h(t).withLog('And I recieve a new post', async () => {
      await h(t).platform(otherUser).createPost(
        { text: `Hi I'm UMI, (${loginUser.rcId})` },
        groupId,
      );
    });

    await h(t).withLog('Then the UMI should exist', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.headerUmi.shouldBeNumber(1);
    })

    await h(t).withLog('When I click the post and jump to the conversation', async () => {
      await bookmarkPage.postItemById(bookmarkPostId).jumpToConversationByClickPost();
    });

    await h(t).withLog('And the UMI should dismiss', async () => {
      await directMessagesSection.headerUmi.shouldBeNumber(0);
    }, true);

    await h(t).withLog('Then I nagivate away from conversation and refresh browser', async () => {
      await bookmarksEntry.enter();
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the UMI count should still no UMI', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.headerUmi.shouldBeNumber(0);
    }, true);
  });

test(formalName('Show UMI when receive new messages after jump to conversation.', ['P2', 'JPT-384', 'zack']), async (t: TestController) => {
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

  await h(t).withLog('When I enter Bookmark page and find the Bookmark posts', async () => {
    await bookmarksEntry.enter();
    await dmSection.headerUmi.shouldBeNumber(0);
  });

  await h(t).withLog('And I jump to conversation from Bookmarks page should no UMI', async () => {
    await bookmarkPage.postItemById(bookmarkPostId).jumpToConversationByClickPost();
    await dmSection.headerUmi.shouldBeNumber(0);
  }, true);

  await h(t).withLog('Then I received new AtMention post should 1 UMI', async () => {
    await h(t).platform(otherUser).createPost(
      { text: `Just for UMI, ![:Person](${loginUser.rcId})` },
      groupId,
    );
    await dmSection.fold();
    await dmSection.headerUmi.shouldBeNumber(1);
  });

  await h(t).withLog('And I scroll to middle should still 1 UMI', async () => {
    await conversationPage.scrollToMiddle();
    await dmSection.headerUmi.shouldBeNumber(1);
  }, true);

  await h(t).withLog('When I scroll to conversation bottom should remove UMI', async () => {
    await conversationPage.scrollToBottom();
    await dmSection.headerUmi.shouldBeNumber(0);
  });
});

test(formalName('Bookmark/Remove Bookmark a message in a conversation', ['P2', 'JPT-330', 'JPT-326', 'zack']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const otherUser = users[5];
    await h(t).resetGlipAccount(user);
    await h(t).platform(user).init();
    await h(t).glip(user).init();
    await h(t).platform(otherUser).init()


    const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
    const conversationPage = app.homePage.messageTab.conversationPage;
    const bookmarkPage = app.homePage.messageTab.bookmarkPage;
    const dmSection = app.homePage.messageTab.directMessagesSection;
    user.sdk = await h(t).getSdk(user);

    let group;
    await h(t).withLog('Given I have an only one group and the group should not be hidden', async () => {
      group = await h(t).platform(user).createGroup({
        type: 'Group', members: [user.rcId, users[5].rcId],
      });
    });

    let bookmarkPost;
    await h(t).withLog('And I have a post', async () => {
      bookmarkPost = await h(t).platform(otherUser).sendTextPost(
        `Hi I'm Bookmarks, (${user.rcId})`,
        group.data.id,
      );
    }, true);

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`And I jump to the specific conversation`, async () => {
      await dmSection.expand();
      await dmSection.conversationEntryById(group.data.id).enter();
    });

    await h(t).withLog('And I bookmark the post then make sure bookmark icon is correct', async () => {
      await conversationPage.postItemById(bookmarkPost.data.id).clickBookmarkToggle();
      await t.expect(conversationPage.postItemById(bookmarkPost.data.id).bookmarkIcon.exists).ok();
    });

    await h(t).withLog('Then I enter Bookmark page and find the Bookmark posts', async () => {
      await bookmarksEntry.enter();
      await t.expect(bookmarkPage.posts.count).eql(1);
    }, true);

    await h(t).withLog('When I click the post and jump to the conversation', async () => {
      await bookmarkPage.postItemById(bookmarkPost.data.id).jumpToConversationByClickPost();
    });

    await h(t).withLog('And I cancel the bookmark in the post then make sure bookmark icon is correct', async () => {
      await conversationPage.postItemById(bookmarkPost.data.id).clickBookmarkToggle();
      await t.expect(conversationPage.postItemById(bookmarkPost.data.id).unBookmarkIcon.exists).ok();
    });

    await h(t).withLog('Then I enter Bookmark page and the bookmark post has been removed', async () => {
      await bookmarksEntry.enter();
      await t.expect(bookmarkPage.posts.count).eql(0);
    }, true);
  })


test(formalName('JPT-733 Can\'t show all received posts when open bookmarks page', ['P2', 'JPT-733', 'Mia.Cai', 'Bookmarks']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[4];
  const otherUser = users[5];
  await h(t).platform(user).init();
  await h(t).platform(otherUser).init();
  const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;

  let teamId;
  await h(t).withLog(`Given I create one new teams`, async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      type: 'Team',
      name: uuid(),
      members: [user.rcId, otherUser.rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open bookmarks page', async () => {
    await bookmarksEntry.enter();
  });

  let message = uuid(), newPostId;
  await h(t).withLog('And I received new message', async () => {
    newPostId = await h(t).platform(otherUser).sentAndGetTextPostId(message, teamId);
  });

  await h(t).withLog('Then I can\'t find the posts in the bookmarks page', async () => {
    await t.expect(bookmarkPage.postItemById(newPostId).exists).notOk({ timeout: 10e3 });
  }, true);

});
