import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('Bookmarks/Bookmarks')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

// skip by bug:https://jira.ringcentral.com/browse/FIJI-3933 
test(formalName('Jump to post position when click button or clickable area of post.', ['P1', 'JPT-315', 'zack', 'Bookmarks']),
  async (t: TestController) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    const teamBookmarkMessage = `team bookmark message ${uuid()}`;
    const privateChatBookmarkMessage = `private chat bookmark message ${uuid()}`;

    let team = <IGroup>{
      type: "Team",
      name: uuid(),
      owner: loginUser,
      members: [loginUser, otherUser]
    }
    let chat = <IGroup>{
      type: "DirectMessage",
      owner: loginUser,
      members: [loginUser, otherUser]
    }

    let bookmarksPostTeamId: string, bookmarksPostChatId: string;
    await h(t).withLog('Given I have an extension with one Bookmarks post in team and one in group (out of screen)', async () => {
      await h(t).scenarioHelper.createTeamsOrChats([team, chat]);
      bookmarksPostTeamId = await h(t).platform(loginUser).sentAndGetTextPostId(
        teamBookmarkMessage,
        team.glipId,
      );
      bookmarksPostChatId = await h(t).platform(loginUser).sentAndGetTextPostId(
        privateChatBookmarkMessage,
        chat.glipId,
      );
      await h(t).glip(loginUser).bookmarkPosts([+bookmarksPostTeamId, +bookmarksPostChatId]);
      for (const i of _.range(3)) {
        await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, otherUser);
        await h(t).scenarioHelper.sendTextPost(H.multilineString(), chat, otherUser);
      }
    });

    const app = new AppRoot(t);
    await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const conversationPage = app.homePage.messageTab.conversationPage;
    const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
    const bookmarkPage = app.homePage.messageTab.bookmarkPage;
    await h(t).withLog('When I go to Bookmarks page', async () => {
      await bookmarksEntry.enter();
    });

    await h(t).withLog('Then I should find the bookmarked post', async () => {
      await t.expect(bookmarkPage.postItemById(bookmarksPostTeamId).exists).ok();
      await t.expect(bookmarkPage.postItemById(bookmarksPostChatId).exists).ok();
    }, true);

    await h(t).withLog('When I click clickable area of team post. (except team name)', async () => {
      await bookmarkPage.postItemById(bookmarksPostTeamId).jumpToConversationByClickPost();
    });

    await h(t).withLog('Then I should jump to the bookmarked post position in the team', async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await conversationPage.groupIdShouldBe(team.glipId);
      await conversationPage.postByIdExpectVisible(bookmarksPostTeamId, true);
      await t
        .expect(conversationPage.postItemById(bookmarksPostTeamId).body.withText(teamBookmarkMessage).exists)
        .ok({ timeout: 5e3 });
    }, true);

    await h(t).withLog('When I go back to Bookmarks page', async () => {
      await bookmarksEntry.enter();
    });

    await h(t).withLog('Then I should find the bookmarked post', async () => {
      await t.expect(bookmarkPage.postItemById(bookmarksPostChatId).exists).ok();
    }, true);

    await h(t).withLog(`When I hover the private chat message then click button - "Jump to conversation"`, async () => {
      await bookmarkPage.postItemById(bookmarksPostChatId).clickConversationByButton();
    });

    await h(t).withLog('Then I should jump to the bookmarked post position in the private chat', async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await conversationPage.groupIdShouldBe(chat.glipId);
      await conversationPage.postByIdExpectVisible(bookmarksPostChatId, true);
      await t
        .expect(conversationPage.postItemById(bookmarksPostChatId).body.withText(privateChatBookmarkMessage).exists)
        .ok({ timeout: 5e3 });
    });
  });


test(formalName('Data in bookmarks page should be dynamically sync.', ['P2', 'JPT-311', 'zack']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const otherUser = users[5];

  await h(t).withLog(`Given I have an extension: ${loginUser.company.number}#${loginUser.extension}, reset its profile`, async () => {
    await h(t).scenarioHelper.resetProfile(loginUser);
  });

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let bookmarksPostTeamId1, bookmarksPostTeamId2, bookmarksPostTeamId3;
  await h(t).withLog(`Given I have one team named ${team.name} and 3 post`, async () => {
    await h(t).scenarioHelper.createTeam(team);
    await h(t).platform(otherUser).init();
    bookmarksPostTeamId1 = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, otherUser);
    bookmarksPostTeamId2 = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, otherUser);
    bookmarksPostTeamId3 = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, otherUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with this extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  await h(t).withLog('And I enter the team conversation page', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
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
    await t.expect(bookmarkPage.postItemById(bookmarksPostTeamId1).exists).ok();
    await t.expect(bookmarkPage.postItemById(bookmarksPostTeamId2).exists).ok();
  }, true);

  await h(t).withLog('When I bookmark 3th post in conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.postItemById(bookmarksPostTeamId3).clickBookmarkToggle();
  });

  await h(t).withLog('And I go to Bookmarks page', async () => {
    await bookmarksEntry.enter();
  });

  await h(t).withLog('Then I have 3 post in bookmark page', async () => {
    await t.expect(bookmarkPage.posts.count).eql(3);
    await t.expect(bookmarkPage.postItemById(bookmarksPostTeamId3).exists).ok();
  }, true);

  await h(t).withLog('When the sender delete the new post', async () => {
    await h(t).glip(otherUser).init();
    await h(t).glip(otherUser).deletePost(bookmarksPostTeamId3, team.glipId);
  });

  await h(t).withLog('Then the last at mention post should not exist in mentions page', async () => {
    await t.expect(bookmarkPage.postItemById(bookmarksPostTeamId3).exists).notOk({ timeout: 10e3 });
  }, true);
})

test(formalName('Remove UMI when jump to conversation which have unread messages.', ['P2', 'JPT-380', 'zack']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const otherUser = users[5];

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog('Given I have an DirectMessage conversation and clear all Umi', async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  let postId;
  await h(t).withLog('And I have a bookmark post in the conversation', async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`Hi AtMention, ![:Person](${loginUser.rcId})`, chat, otherUser);
    await h(t).glip(loginUser).bookmarkPosts(postId);
  });

  await h(t).withLog('And I set last open group is me chat', async () => {
    await h(t).glip(loginUser).setLastGroupIdIsMeChatId();
  });

  const app = new AppRoot(t);
  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;

  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter bookmark page', async () => {
    await bookmarkEntry.enter();
  }, true);

  await h(t).withLog('Then I should find the bookmark posts', async () => {
    await t.expect(bookmarkPage.postItemById(postId).exists).ok()
  });

  await h(t).withLog('And the UMI should exist', async () => {
    await directMessagesSection.fold();
    await directMessagesSection.headerUmi.shouldBeNumber(1);
  })

  await h(t).withLog('When I click the post and jump to the conversation', async () => {
    await bookmarkPage.postItemById(postId).jumpToConversationByClickPost();
  });

  await h(t).withLog('And the UMI should dismiss', async () => {
    await directMessagesSection.headerUmi.shouldBeNumber(0);
  }, true);

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I navigate away from conversation and refresh browser', async () => {
    await app.homePage.messageTab.favoritesSection.nthConversationEntry(0).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await h(t).reload();

    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then the UMI count should still no UMI', async () => {
    await directMessagesSection.fold();
    await directMessagesSection.headerUmi.shouldBeNumber(0);
  }, true);
});

// skip by bug:https://jira.ringcentral.com/browse/FIJI-3933 
test.skip(formalName('Show UMI when receive new messages after jump to conversation.', ['P2', 'JPT-384', 'zack']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const otherUser = users[5];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let bookmarkId;
  await h(t).withLog('Given I have an AtMention message from the conversation', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
    bookmarkId = await h(t).scenarioHelper.sentAndGetTextPostId(`I'm bookmark, ![:Person](${loginUser.rcId})`, chat, otherUser);
  });

  await h(t).withLog('And I also have more one screen post', async () => {
    for (const i of _.range(4)) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), chat, otherUser);
    }
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I jump to the specific conversation And I bookmark the post`, async () => {
    await chatEntry.enter();
    await conversationPage.postItemById(bookmarkId).clickBookmarkToggle();
  });

  await h(t).withLog('And I enter Bookmark page', async () => {
    await app.homePage.messageTab.bookmarksEntry.enter();
  });

  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  await h(t).withLog('Then I should find the Bookmark posts', async () => {
    await t.expect(bookmarkPage.postItemById(bookmarkId).exists).ok();
  }, true);

  await h(t).withLog('When I receive more than one screen normal post', async () => {
    for (const i of _.range(4)) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(15), chat, otherUser);
    }
  });

  await h(t).withLog('And I jump to conversation from Bookmarks page ', async () => {
    await bookmarkPage.postItemById(bookmarkId).jumpToConversationByClickPost();
  });

  await h(t).withLog('Then the bookmark should be visible', async () => {
    await conversationPage.groupIdShouldBe(chat.glipId);
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.postByIdExpectVisible(bookmarkId, true)
  }, true);

  await h(t).withLog('And the conversation should have not any UMI', async () => {
    await chatEntry.umi.shouldBeNumber(0);
  }, true);

  await h(t).withLog('When I received new post', async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, otherUser);
  });

  await h(t).withLog('And the conversation should have 1 umi', async () => {
    await chatEntry.umi.shouldBeNumber(1);
  }, true);


  await h(t).withLog('When I scroll to middle', async () => {
    await conversationPage.scrollToMiddle();
  });

  await h(t).withLog('Then the Umi should still be 1', async () => {
    await chatEntry.umi.shouldBeNumber(1);
  });

  await h(t).withLog('When I scroll to conversation bottom', async () => {
    await conversationPage.scrollToBottom();
  });

  await h(t).withLog('Then the Umi should dismiss', async () => {
    await chatEntry.umi.shouldBeNumber(0);
  });

  await h(t).withLog('When I switch to other conversation then refresh page', async () => {
    await app.homePage.messageTab.favoritesSection.nthConversationEntry(0).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await h(t).reload();
    await app.homePage.ensureLoaded();
  }, true);

  await h(t).withLog('Then the Umi should dismiss', async () => {
    await chatEntry.umi.shouldBeNumber(0);
  });
});

test(formalName('Bookmark/Remove Bookmark a message in a conversation', ['P2', 'JPT-330', 'JPT-326', 'zack']),
  async (t: TestController) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    const otherUser = users[5];

    let chat = <IGroup>{
      type: "DirectMessage",
      owner: loginUser,
      members: [loginUser, otherUser]
    }

    await h(t).withLog('Given I have an extension with a chat and clear all bookmark post.', async () => {
      await h(t).scenarioHelper.resetProfileAndState(loginUser);
      await h(t).scenarioHelper.createOrOpenChat(chat);
    });

    let bookmarkPostId;
    await h(t).withLog('And the chat have a post', async () => {
      bookmarkPostId = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), chat, otherUser);
    });

    const app = new AppRoot(t);
    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
    const conversationPage = app.homePage.messageTab.conversationPage;
    const bookmarkPage = app.homePage.messageTab.bookmarkPage;
    const dmSection = app.homePage.messageTab.directMessagesSection;
    await h(t).withLog(`And I jump to the specific conversation`, async () => {
      await dmSection.expand();
      await dmSection.conversationEntryById(chat.glipId).enter();
    });

    await h(t).withLog('And I bookmark the post then make sure bookmark icon is correct', async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await conversationPage.postItemById(bookmarkPostId).clickBookmarkToggle();
      await t.expect(conversationPage.postItemById(bookmarkPostId).bookmarkIcon.exists).ok();
    });

    await h(t).withLog('Then I enter Bookmark page and find the Bookmark posts', async () => {
      await bookmarksEntry.enter();
      await t.expect(bookmarkPage.posts.count).eql(1);
      await t.expect(bookmarkPage.postItemById(bookmarkPostId).exists).ok();
    }, true);

    await h(t).withLog('When I click the post and jump to the conversation', async () => {
      await bookmarkPage.postItemById(bookmarkPostId).jumpToConversationByClickPost();
    });

    await h(t).withLog('And I cancel the bookmark in the post then make sure bookmark icon is correct', async () => {
      await conversationPage.postItemById(bookmarkPostId).clickBookmarkToggle();
      await t.expect(conversationPage.postItemById(bookmarkPostId).unBookmarkIcon.exists).ok();
    });

    await h(t).withLog('Then I enter Bookmark page and the bookmark post has been removed', async () => {
      await bookmarksEntry.enter();
      await t.expect(bookmarkPage.posts.count).eql(0);
      await t.expect(bookmarkPage.postItemById(bookmarkPostId).exists).notOk();
    }, true);
  })


test(formalName('JPT-733 Can\'t show all received posts when open bookmarks page', ['P2', 'JPT-733', 'Mia.Cai', 'Bookmarks']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I create one directMessage conversation`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open bookmarks page', async () => {
    await app.homePage.messageTab.bookmarksEntry.enter();
  });

  let newPostId;
  await h(t).withLog('And I received new message', async () => {
    await h(t).platform(otherUser).init();
    newPostId = await h(t).platform(otherUser).sentAndGetTextPostId(uuid(), chat.glipId);
  });

  await h(t).withLog('Then I can\'t find the posts in the bookmarks page', async () => {
    const mentionPage = app.homePage.messageTab.mentionPage;
    await t.expect(mentionPage.postItemById(newPostId).exists).notOk({ timeout: 10e3 });
  }, true);

});
