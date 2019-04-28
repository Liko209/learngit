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

test(formalName('Jump to post position when click jump to conversation button.[Bookmarks]', ['P1', 'JPT-315', 'zack', 'Bookmarks']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];

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

  const conversations = [team, chat]
  let postIds: string[] = [];
  await h(t).withLog('Given I have 1 bookmark post in team, 1 in group.(out of screen)', async () => {
    await h(t).scenarioHelper.createTeamsOrChats(conversations);
    for (const conversation of conversations) {
      const postId = await h(t).scenarioHelper.sentAndGetTextPostId(
        `${uuid()}, ![:Person](${loginUser.rcId})`,
        conversation, otherUser
      );
      postIds.push(postId);
      for (const i of _.range(3)) {
        await h(t).scenarioHelper.sendTextPost(H.multilineString(), conversation, otherUser);
      }
    }
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).bookmarkPosts(postIds);
  });

  const app = new AppRoot(t);
  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  for (const i in conversations) {
    await h(t).withLog('When I enter bookmark page', async () => {
      await bookmarkEntry.enter();
    });

    await h(t).withLog(`And I click the ${conversations[i].type} post. (except team name)`, async () => {
      await bookmarkPage.postItemById(postIds[i]).clickSelf();
    });

    await h(t).withLog('Then No response after clicking', async () => {
      await bookmarkEntry.ensureLoaded();
      await bookmarkPage.postItemById(postIds[i]).ensureLoaded();
    }, true);

    await h(t).withLog('When I hover the at bookmark post then click button - "Jump to conversation"', async () => {
      await bookmarkPage.postItemById(postIds[i]).hoverPostAndClickJumpToConversationButton();
    });

    await h(t).withLog(`Then I should jump to the bookmark post position in the team `, async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await conversationPage.groupIdShouldBe(conversations[i].glipId);
      await conversationPage.postCardByIdShouldBeOnTheTop(postIds[i]);
    });

    await h(t).withLog('And this post will be highlighted', async () => {
      await conversationPage.postItemById(postIds[i]).shouldBeHighLight();
    });
  }
});

//skip due to https://jira.ringcentral.com/browse/FIJI-4527
test(formalName('Jump to conversation bottom when click name and conversation show in the top of conversation list.[Bookmarks]', ['P2', 'JPT-314', 'Bookmarks']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }
  let group = <IGroup>{
    type: "Group",
    owner: loginUser,
    members: [loginUser, otherUser, users[7]]
  }
  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  const bookmarkGroups = [chat, group, team];
  await h(t).withLog('Given I have an extension with 3 different types of conversations and each has a post with bookmark', async () => {
    await h(t).scenarioHelper.createTeamsOrChats(bookmarkGroups);
  });

  let postIds = []
  await h(t).withLog(`And and each has a post with bookmark and some other post`, async () => {
    for (const bookmarkGroup of bookmarkGroups) {
      for (const i of _.range(3)) {
        await h(t).scenarioHelper.sentAndGetTextPostId(H.multilineString(), bookmarkGroup, otherUser);
      }
      const postId = await h(t).scenarioHelper.sentAndGetTextPostId(`${uuid()} bookmark`, bookmarkGroup, otherUser);
      postIds.push(postId)
    }
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).bookmarkPosts(postIds);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('Then I can find 3 posts in the bookmarks page', async () => {
    await bookmarkEntry.enter();
     for (const postId of postIds) {
      await t.expect(bookmarkPage.postItemById(postId).exists).ok();
    }
  }, true);

  for (const i in bookmarkGroups) {
    let conversationName;
    await h(t).withLog(`When I enter bookmarks page`, async () => {
      await bookmarkEntry.enter();
      conversationName = await bookmarkPage.postItemById(postIds[i]).conversationName.textContent
    });

    await h(t).withLog(`and I click the conversation name ${conversationName} in one conversation card`, async () => {
      await bookmarkPage.postItemById(postIds[i]).jumpToConversationByClickName();
    });

    await h(t).withLog('And should jump to the chat page and scroll to bottom', async () => {
      await conversationPage.groupIdShouldBe(bookmarkGroups[i].glipId);
      await conversationPage.expectStreamScrollToBottom();
    });
  }
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

  await h(t).withLog('Then the last at bookmark post should not exist in bookmarks page', async () => {
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
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`Hi Atbookmark, ![:Person](${loginUser.rcId})`, chat, otherUser);
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
    await bookmarkPage.postItemById(postId).hoverPostAndClickJumpToConversationButton();
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

test(formalName('Show UMI when receive new messages after jump to conversation.', ['P2', 'JPT-384', 'zack']), async (t: TestController) => {
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
  await h(t).withLog('Given I have an Atbookmark message from the conversation', async () => {
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
    await bookmarkPage.postItemById(bookmarkId).hoverPostAndClickJumpToConversationButton();
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
      await bookmarkPage.postItemById(bookmarkPostId).hoverPostAndClickJumpToConversationButton();
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
    const bookmarkPage = app.homePage.messageTab.bookmarkPage;
    await t.expect(bookmarkPage.postItemById(newPostId).exists).notOk({ timeout: 10e3 });
  }, true);

});



test(formalName('JPT-1147 Can like/unlike message in bookmark list', ['P2', 'JPT-1147', 'Foden.lin', 'Bookmarks']),
async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[7];
  const otherUser = users[5];


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
  }, true);

  const BookPostCard = bookmarkPage.postItemById(bookmarkPost.data.id);
  await h(t).withLog(`When I click "unlike" button`, async () => {
    await BookPostCard.clickLikeOnActionBar();
  });


  await h(t).withLog(`Then bookmarkPost action bar 'unlike' icon change to 'like', and bookmarkPost card footer appear "like" icon with number 1`, async () => {
    await t.hover(BookPostCard.self);
    await t.expect(BookPostCard.unlikeIconOnActionBar.exists).ok();
    await t.expect(BookPostCard.unlikeIconOnFooter.exists).ok();
    await BookPostCard.likeShouldBe(1);
  });


  await h(t).withLog(`When I click solid 'like' icon on action bar`, async () => {
    await BookPostCard.clickLikeOnActionBar();
    });

  await h(t).withLog(`Then Action bar solid "like" icon change to hollow "unlike" icon and like number should be 0 on message card `, async () => {
    await t.hover(BookPostCard.self);
    await t.expect(BookPostCard.likeIconOnActionBar.exists).ok();
    await t.expect(BookPostCard.likeButtonOnFooter.exists).notOk();
    await BookPostCard.likeShouldBe(0);
  });

});
