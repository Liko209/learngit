import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('Bookmarks/Bookmarks')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

  
test(formalName('Jump to post position when click button or clickable area of post.',['P1','JPT-315','zack']),
  async (t: TestController)=>{
  const app =new AppRoot(t);
  const users =h(t).rcData.mainCompany.users;
  const user = users[4];
  const user5Platform = await h(t).getPlatform(users[5]);
  user.sdk = await h(t).getSdk(user);

  const conversationPage = app.homePage.messageTab.conversationPage;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const dmSection=app.homePage.messageTab.directMessagesSection;
  const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;

  let verifyTextTeam = 'First Bookmarks in Team';
  let verifyTextChat = 'First Bookmarks in pvChat';

  let teamId, pvChatId, bookmarksPostTeam, bookmarksPostChat;
  await h(t).withLog('Given I have 1 Bookmarks post in team ,one in group', async () => {
    teamId = (await user.sdk.platform.createGroup({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [user.rcId, users[5].rcId, users[6].rcId],
    })).data.id;
    pvChatId = (await user.sdk.platform.createGroup({
      type: 'PrivateChat',
      members: [user.rcId, users[5].rcId],
    })).data.id;

    await user.sdk.glip.showGroups(user.rcId, [ pvChatId, teamId ]);
    await user.sdk.glip.clearFavoriteGroupsRemainMeChat();

    bookmarksPostTeam = await user5Platform.sendTextPost( 
      verifyTextTeam + `, (${user.rcId})`,
      teamId,
    );
    bookmarksPostChat = await user5Platform.sendTextPost(
      verifyTextChat + `, (${user.rcId})`,
      pvChatId,
    );

  });

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the team conversation page', async () => {

    await teamsSection.expand();
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog('And I bookmark the team post', async () => {
    await conversationPage.postItemById(bookmarksPostTeam.data.id).clickBookmarkToggle();
  });

  await h(t).withLog('When I go to Bookmarks page', async () => {
    await bookmarksEntry.enter();
  });

  await h(t).withLog('And I click the Bookmarks post item then jump to pvTeam', async () => {
    await bookmarkPage.postItemById(bookmarksPostTeam.data.id).clickConversationByButton();
  });

  await h(t).withLog('Then I can see the Bookmarks post in the pvTeam', async () => {
    await t
      .expect(conversationPage.postItemById(bookmarksPostTeam.data.id).body.withText(verifyTextTeam).exists)
      .ok({ timeout: 5e3 });
  });

  await h(t).withLog('When I enter the team conversation page', async () => {
    await dmSection.expand();
    await dmSection.conversationEntryById(pvChatId).enter();
  });

  await h(t).withLog('And I bookmark the DM post', async () => {
    await t.wait(3e3);
    await conversationPage.postItemById(bookmarksPostChat.data.id).clickBookmarkToggle();
  });

  await h(t).withLog('When I back to Bookmarks page', async () => {
    await bookmarksEntry.enter();
  });

  await h(t).withLog('And I click the Bookmarks post item then jump to pvChat', async () => {
    await bookmarkPage.postItemById(bookmarksPostChat.data.id).jumpToConversationByClickName();
  });

  await h(t).withLog('Then I can see the Bookmarks post in the pvChat', async () => {
    await t
      .expect(conversationPage.postItemById(bookmarksPostChat.data.id).body.withText(verifyTextChat).exists)
      .ok({ timeout: 5e3 });
  });
});

test(formalName('Remove UMI when jump to conversation which have unread messages.',['P2','JPT-380','zack']),
  async (t: TestController)=>{
    const app =new AppRoot(t);
    const users =h(t).rcData.mainCompany.users;
    const user = users[7];
    await h(t).resetGlipAccount(user);
    const userPlatform = await h(t).getPlatform(user);
    const user5Platform = await h(t).getPlatform(users[5]);
    const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
    const postListPage = app.homePage.messageTab.postListPage;
    const conversationPage =app.homePage.messageTab.conversationPage;
    const bookmarkPage = app.homePage.messageTab.bookmarkPage;
    const dmSection = app.homePage.messageTab.directMessagesSection;
    user.sdk = await h(t).getSdk(user);
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let group;
    await h(t).withLog('Given I have an only one group and the group should not be hidden', async () => {
      group = await userPlatform.createGroup({
        type: 'Group', members: [user.rcId, users[5].rcId],
      });
      await user.sdk.glip.showGroups(user.rcId, group.data.id);
    });

    let bookmarkPost;
    await h(t).withLog('And I have a post', async () => {
      bookmarkPost = await user5Platform.sendTextPost(
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

    await h(t).withLog('And I bookmark the post', async () => {
      await conversationPage.postItemById(bookmarkPost.data.id).clickBookmarkToggle();
    });

    await h(t).withLog('Then I enter Bookmark page and find the Bookmark posts', async () => {
      await bookmarksEntry.enter();
      await t.expect(postListPage.find('[data-name="conversation-card"]').count).eql(1);
    }, true);

    let umiPost;
    await h(t).withLog('And I recieve a new post', async () => {
      umiPost = await user5Platform.createPost(
        { text: `Hi I'm UMI, (${user.rcId})` },
        group.data.id,
      );
    });

    await h(t).withLog('Then the UMI should exist', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.expectHeaderUmi(1);
    })

    await h(t).withLog('When I click the post and jump to the conversation', async () => {
      await bookmarkPage.postItemById(bookmarkPost.data.id).jumpToConversationByClickPost();
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

test(formalName('Show UMI when receive new messages after jump to conversation.',['P2','JPT-384','zack']), async (t: TestController)=>{
  if (await H.isEdge()) {
    await h(t).log('Skip: This case is not working on Edge due to a Testcafe bug (FIJI-1758)');
    return;
  }

  const app =new AppRoot(t);
  const users =h(t).rcData.mainCompany.users;
  const user = users[4];
  await h(t).resetGlipAccount(user);
  const userPlatform = await h(t).getPlatform(user);
  const user5Platform = await h(t).getPlatform(users[5]);
  const bookmarksEntry = app.homePage.messageTab.bookmarksEntry;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const dmSection = app.homePage.messageTab.directMessagesSection;
  const conversationPage =app.homePage.messageTab.conversationPage;
  user.sdk = await h(t).getSdk(user);
  const msgList = _.range(20).map(i => `${i} ${uuid()}`);

  let group;
  let bookmarkPost;
  await h(t).withLog('Given I have an AtMention message from the conversation', async () => {
    group = await userPlatform.createGroup({
      type: 'Group', members: [user.rcId, users[5].rcId],
    });
    await user.sdk.glip.updateProfile(user.rcId, {
      [`hide_group_${group.data.id}`]: false
    });
    bookmarkPost = await user5Platform.createPost(
      { text: `I'm Bookmarks, ![:Person](${user.rcId})`},
      group.data.id,
    );
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I jump to the specific conversation`, async () => {
    await dmSection.expand();
    await dmSection.conversationEntryById(group.data.id).enter();
  });

  await h(t).withLog('And I bookmark the post', async () => {
    await conversationPage.postItemById(bookmarkPost.data.id).clickBookmarkToggle();
  });

  await h(t).withLog('Then I send 20 messages in conversation', async () => {
    for (const msg of msgList) {
      await userPlatform.createPost({ text: msg }, group.data.id);
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
    await bookmarkPage.postItemById(bookmarkPost.data.id).jumpToConversationByClickPost();
    await dmSection.expectHeaderUmi(0);
  }, true);

  await h(t).withLog('Then I received new AtMention post should 1 UMI', async () => {
    await user5Platform.createPost(
      { text: `Just for UMI, ![:Person](${user.rcId})`},
      group.data.id,
    );
    await dmSection.fold();
    await dmSection.expectHeaderUmi(1);
  });

  await h(t).withLog('And I scroll to middle should still 1 UMI', async () => {
    await conversationPage.scrollToMiddle();
    await dmSection.expectHeaderUmi(1);
  },true);

  await h(t).withLog('When I scroll to conversation bottom should remove UMI', async () => {
    await conversationPage.scrollToBottom();
    await dmSection.expectHeaderUmi(0);
  });
});
