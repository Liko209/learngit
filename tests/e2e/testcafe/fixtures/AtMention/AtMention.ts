/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-13 13:26:25
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('AtMention/AtMention')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Data in mention page should be dynamically sync', ['P2', 'JPT-311']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const otherUser = users[5];
  await h(t).resetGlipAccount(loginUser);
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).platform(otherUser).init();
  await h(t).glip(otherUser).init();

  const mentionsEntry = app.homePage.messageTab.mentionsEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;
  let groupId;
  await h(t).withLog('Given I have an extension with 2 at-mention posts', async () => {
    groupId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Group', members: [loginUser.rcId, otherUser.rcId, users[6].rcId],
    });

    await h(t).platform(otherUser).sendTextPost(
      `Hi, ![:Person](${loginUser.rcId})`,
      groupId,
    );
    await h(t).platform(otherUser).sendTextPost(
      `Hi again, ![:Person](${loginUser.rcId})`,
      groupId,
    );
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can find 2 posts in the mentions page', async () => {
    await mentionsEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await t.expect(mentionPage.posts.count).eql(2);
  }, true);

  let newPostId;
  await h(t).withLog('Then I send a new post to user with mention', async () => {
    newPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `Test add a mention, ![:Person](${loginUser.rcId})`,
      groupId,
    );
  });

  await h(t).withLog('Then I can find 3 posts in the mentions page', async () => {
    await mentionsEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await t.expect(mentionPage.posts.count).eql(3);
  }, true);

  await h(t).withLog('Then I delete the new post', async () => {
    await h(t).glip(otherUser).deletePost(newPostId, groupId);
  });

  await h(t).withLog('Then I can find 2 posts in the mentions page', async () => {
    await mentionsEntry.enter();
    await mentionPage.waitUntilPostsBeLoaded();
    await t.expect(mentionPage.posts.count).eql(2);
  }, true);
},
);

test(formalName('Jump to conversation bottom when click name and conversation show in the top of conversation list', ['P2', 'JPT-314']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    const otherUser = users[5];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).platform(otherUser).init();

    const mentionsEntry = app.homePage.messageTab.mentionsEntry;
    const mentionPage = app.homePage.messageTab.mentionPage;
    const conversationPage = app.homePage.messageTab.conversationPage;
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let chatId, groupId, teamId;
    let chatPostId, groupPostId, teamPostId;
    await h(t).withLog('Given I have an extension with 3 different types of conversations and each has a post with mention', async () => {
      chatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat', members: [loginUser.rcId, otherUser.rcId],
      });
      groupId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group', members: [loginUser.rcId, otherUser.rcId, users[6].rcId],
      });
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `Team ${uuid()}`,
        members: [loginUser.rcId, otherUser.rcId],
      });
      chatPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
        `Hi, ![:Person](${loginUser.rcId})`,
        chatId,
      );
      groupPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
        `Hi, ![:Person](${loginUser.rcId})`,
        groupId,
      );
      teamPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
        `Hi, ![:Person](${loginUser.rcId})`,
        teamId,
      );
      await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();

    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I can find 3 posts in the mentions page', async () => {
      await mentionsEntry.enter();
      await mentionPage.waitUntilPostsBeLoaded();
      await t.expect(mentionPage.posts.count).gte(3);
      await t.expect(mentionPage.postItemById(chatPostId).exists).ok();
      await t.expect(mentionPage.postItemById(groupPostId).exists).ok();
      await t.expect(mentionPage.postItemById(teamPostId).exists).ok();
    }, true);

    await h(t).withLog('When I click the conversation name in the chat\'s conversation card', async () => {
      await mentionPage.postItemById(chatPostId).jumpToConversationByClickName();
    });

    await h(t).withLog('And should jump to the chat page and scroll to bottom', async () => {
      await conversationPage.groupIdShouldBe(chatId);
      await conversationPage.expectStreamScrollToBottom();
    });

    await h(t).withLog('When I click the conversation name in the group\'s conversation card', async () => {
      await mentionsEntry.enter();
      await mentionPage.waitUntilPostsBeLoaded();
      await mentionPage.postItemById(groupPostId).jumpToConversationByClickName();
      await conversationPage.waitUntilPostsBeLoaded();
    });

    await h(t).withLog('Then should jump to the group page and scroll to bottom', async () => {
      await conversationPage.groupIdShouldBe(groupId);
      await conversationPage.expectStreamScrollToBottom();
    });


    await h(t).withLog('When I click the conversation name in the team\'s conversation card', async () => {
      await mentionsEntry.enter();
      await mentionPage.waitUntilPostsBeLoaded();
      await mentionPage.postItemById(teamPostId).jumpToConversationByClickName();
    });

    await h(t).withLog('Then should jump to the team page and scroll to bottom', async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await conversationPage.groupIdShouldBe(teamId);
      await conversationPage.expectStreamScrollToBottom();
    });

  },
);

test(formalName('Remove UMI when jump to conversation which have unread messages.', ['P2', 'JPT-380', 'zack']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    const otherUser = users[5];
    await h(t).resetGlipAccount(loginUser);
    await h(t).platform(loginUser).init();
    await h(t).platform(otherUser).init();


    const mentionsEntry = app.homePage.messageTab.mentionsEntry;
    const mentionPage = app.homePage.messageTab.mentionPage;
    const postMentionPage = app.homePage.messageTab.mentionPage;
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let groupId;
    await h(t).withLog('Given I have an only one group and the group should not be hidden', async () => {
      groupId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group', members: [loginUser.rcId, users[5].rcId],
      });
    });

    let newPostId;
    await h(t).withLog('And I have an AtMention post', async () => {
      newPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
        `Hi AtMention, ![:Person](${loginUser.rcId})`,
        groupId,
      );
    }, true);

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('And I enter AtMention page and find the AtMention posts', async () => {
      await mentionsEntry.enter();
      await t.expect(mentionPage.posts.count).eql(1);
    }, true);

    await h(t).withLog('Then the UMI should exist', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.headerUmi.shouldBeNumber(1);
    })

    await h(t).withLog('When I click the post and jump to the conversation', async () => {
      await postMentionPage.postItemById(newPostId).jumpToConversationByClickPost();
    });

    await h(t).withLog('And the UMI should dismiss', async () => {
      await directMessagesSection.headerUmi.shouldBeNumber(0);
    }, true);

    await h(t).withLog('Then I navigate away from conversation and refresh browser', async () => {
      await mentionsEntry.enter();
      await mentionPage.waitUntilPostsBeLoaded();
      await h(t).refresh();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the UMI count should still no UMI', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.headerUmi.shouldBeNumber(0);
    }, true);
  }
);

test(formalName('Show UMI when receive new messages after jump to conversation.', ['P2', 'JPT-384', 'zack']), async (t: TestController) => {
  if (await H.isEdge()) {
    await h(t).log('Skip: This case is not working on Edge due to a Testcafe bug (FIJI-1758)');
    return;
  }

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const otherUser = users[5];
  await h(t).resetGlipAccount(loginUser);

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  await h(t).platform(otherUser).init();

  const mentionsEntry = app.homePage.messageTab.mentionsEntry;
  const postMentionPage = app.homePage.messageTab.mentionPage;
  const conversationPage = app.homePage.messageTab.conversationPage;

  const msgList = _.range(20).map(i => `${i} ${uuid()}`);

  let groupId, newPostId;
  await h(t).withLog('Given I have an AtMention message from the conversation', async () => {
    groupId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Group', members: [loginUser.rcId, users[5].rcId],
    });
    newPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `First AtMention, ![:Person](${loginUser.rcId})`,
      groupId,
    );
  });

  await h(t).withLog('And I also have 20 non AtMention messages in conversation', async () => {
    for (const msg of msgList) {
      await h(t).platform(loginUser).sendTextPost(msg, groupId);
      await t.wait(1e3);
    }
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  await h(t).withLog('And I jump to conversation from AtMentions page should no UMI', async () => {
    await mentionsEntry.enter();
    await postMentionPage.waitUntilPostsBeLoaded();
    await postMentionPage.postItemById(newPostId).jumpToConversationByClickPost();
    await directMessagesSection.headerUmi.shouldBeNumber(0);
  }, true);

  await h(t).withLog('Then I received new AtMention post should 1 UMI', async () => {
    await h(t).platform(otherUser).sendTextPost(
      `Just for UMI, ![:Person](${loginUser.rcId})`,
      groupId,
    );
    await directMessagesSection.fold();
    await directMessagesSection.headerUmi.shouldBeNumber(1);
  });

  await h(t).withLog('And I scroll to middle should still 1 UMI', async () => {
    await conversationPage.scrollToMiddle();
    await directMessagesSection.headerUmi.shouldBeNumber(1);
  }, true);

  await h(t).withLog('When I scroll to conversation bottom should remove UMI', async () => {
    await conversationPage.scrollToBottom();
    await directMessagesSection.headerUmi.shouldBeNumber(0);
  });
});


test(formalName('Jump to post position when click button or clickable area of post.', ['P1', 'JPT-315', 'zack']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    const otherUser = users[5];
    await h(t).platform(loginUser).init();
    await h(t).platform(otherUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfile();

    const mentionsEntry = app.homePage.messageTab.mentionsEntry;
    const postMentionPage = app.homePage.messageTab.mentionPage;
    const conversationPage = app.homePage.messageTab.conversationPage;

    let verifyTextTeam = uuid();
    let verifyTextChat = uuid();

    let teamId, pvChatId, atMentionTeamPostId, atMentionChatPostId;
    await h(t).withLog('Given I have 1 AtMention post in team ,one in group', async () => {
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

      atMentionTeamPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
        `${verifyTextTeam}, ![:Person](${loginUser.rcId})`,
        teamId,
      );
      atMentionChatPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
        `${verifyTextChat}, ![:Person](${loginUser.rcId})`,
        pvChatId,
      );

    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('And I enter AtMentions page', async () => {
      await mentionsEntry.enter();
      await postMentionPage.waitUntilPostsBeLoaded();
    });

    await h(t).withLog('And I click the post item', async () => {
      await postMentionPage.postItemById(atMentionTeamPostId).jumpToConversationByClickPost();
    });

    await h(t).withLog('Then I can see the AtMention post in the team', async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await t
        .expect(conversationPage.postItemById(atMentionTeamPostId).body.withText(verifyTextTeam).exists)
        .ok({ timeout: 5e3 });
    }, true);

    await h(t).withLog('When I back to AtMention page', async () => {
      await mentionsEntry.enter();
      await postMentionPage.waitUntilPostsBeLoaded();
    });

    await h(t).withLog('And I click AtMention post item from pvChat', async () => {
      await postMentionPage.postItemById(atMentionChatPostId).clickConversationByButton();
    });

    await h(t).withLog('Then I can see the AtMention post in the pvChat', async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await t
        .expect(conversationPage.postItemById(atMentionChatPostId).body.withText(verifyTextChat).exists)
        .ok({ timeout: 5e3 });
    });
  });

test(formalName('JPT-733 Can\'t show all received posts when open mentions page', ['P2', 'JPT-733', 'Mia.Cai','AtMention']), async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    const otherUser = users[5];
    await h(t).platform(user).init();
    await h(t).platform(otherUser).init();
    const mentionsEntry = app.homePage.messageTab.mentionsEntry;
    const mentionPage = app.homePage.messageTab.mentionPage;

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

    await h(t).withLog('And I open mentions page', async () => {
      await mentionsEntry.enter();
    });

    let message = uuid(), newPostId;
    await h(t).withLog('And I received new message', async () => {
      newPostId = await h(t).platform(otherUser).sentAndGetTextPostId(message, teamId);
    });

    await h(t).withLog('Then I can\'t find the posts in the mentions page', async () => {
      await t.expect(mentionPage.postItemById(newPostId).exists).notOk({timeout: 10e3});
    }, true);

  },);
