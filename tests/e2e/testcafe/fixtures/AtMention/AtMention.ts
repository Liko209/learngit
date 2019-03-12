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
import { IGroup } from '../../v2/models';

fixture('AtMention/AtMention')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Data in mention page should be dynamically sync', ['P2', 'JPT-311']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const otherUser = users[5];

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let postId1, postId2;
  await h(t).withLog('Given I have an extension with 2 at-mention posts', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
    postId1 = await h(t).scenarioHelper.sentAndGetTextPostId(`Hi, ![:Person](${loginUser.rcId})`, chat, otherUser);
    postId2 = await h(t).scenarioHelper.sentAndGetTextPostId(`Hi again, ![:Person](${loginUser.rcId})`, chat, otherUser);
  });

  const app = new AppRoot(t);

  const mentionsEntry = app.homePage.messageTab.mentionsEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can find 2 posts in the mentions page', async () => {
    await mentionsEntry.enter();
    await t.expect(mentionPage.postItemById(postId1).exists).ok();
    await t.expect(mentionPage.postItemById(postId2).exists).ok();
  }, true);

  let newPostId;
  await h(t).withLog('When other user send a new at mention post to this extension', async () => {
    newPostId = await h(t).scenarioHelper.sentAndGetTextPostId(`Hi last one, ![:Person](${loginUser.rcId})`, chat, otherUser);
  });

  await h(t).withLog('Then I can find 3 posts in the mentions page', async () => {
    await t.expect(mentionPage.postItemById(newPostId).exists).ok({ timeout: 10e3 });
  }, true);

  await h(t).withLog('Then the sender delete the new post', async () => {
    await h(t).glip(otherUser).init();
    await h(t).glip(otherUser).deletePost(newPostId, chat.glipId);
  });

  await h(t).withLog('Then the last at mention post should not exist in mentions page', async () => {
    await t.expect(mentionPage.postItemById(newPostId).exists).notOk({ timeout: 10e3 });
  }, true);
});

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
      await mentionPage.postItemById(groupPostId).jumpToConversationByClickName();
    });

    await h(t).withLog('Then should jump to the group page and scroll to bottom', async () => {
      await conversationPage.groupIdShouldBe(groupId);
      await conversationPage.expectStreamScrollToBottom();
    });


    await h(t).withLog('When I click the conversation name in the team\'s conversation card', async () => {
      await mentionsEntry.enter();
      await mentionPage.postItemById(teamPostId).jumpToConversationByClickName();
    });

    await h(t).withLog('Then should jump to the team page and scroll to bottom', async () => {
      await conversationPage.groupIdShouldBe(teamId);
      await conversationPage.expectStreamScrollToBottom();
    });

  },
);

test(formalName('Remove UMI when jump to conversation which have unread messages.', ['P2', 'JPT-380', 'zack']),
  async (t: TestController) => {
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
    await h(t).withLog('And I have an AtMention post in the conversation', async () => {
      postId = await h(t).scenarioHelper.sentAndGetTextPostId(`Hi AtMention, ![:Person](${loginUser.rcId})`, chat, otherUser);
    });

    await h(t).withLog('And I set last open group is me chat', async () => {
      await h(t).glip(loginUser).setLastGroupIdIsMeChatId();
    });

    const app = new AppRoot(t);
    const mentionsEntry = app.homePage.messageTab.mentionsEntry;
    const mentionPage = app.homePage.messageTab.mentionPage;
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('When I enter AtMention page and find the AtMention posts', async () => {
      await mentionsEntry.enter();
    }, true);

    await h(t).withLog('Then the UMI should exist', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.headerUmi.shouldBeNumber(1);
    })

    await h(t).withLog('When I click the post and jump to the conversation', async () => {
      await mentionPage.postItemById(postId).jumpToConversationByClickPost();
    });

    await h(t).withLog('And the UMI should dismiss', async () => {
      await directMessagesSection.headerUmi.shouldBeNumber(0);
    }, true);

    await h(t).withLog('Then I navigate away from conversation and refresh browser', async () => {
      await mentionsEntry.enter();
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the UMI count should still no UMI', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.headerUmi.shouldBeNumber(0);
    }, true);
  }
);

// skip by bug: 
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

  let newPostId;
  await h(t).withLog('Given I have an AtMention message from the conversation', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
    newPostId = await h(t).scenarioHelper.sentAndGetTextPostId(`First AtMention, ![:Person](${loginUser.rcId})`, chat, otherUser);
  });

  await h(t).withLog('And I also have more one screen post', async () => {
    for (const i of _.range(4)) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), chat, otherUser);
    }
  });

  const app = new AppRoot(t);
  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  const mentionsEntry = app.homePage.messageTab.mentionsEntry;
  const postMentionPage = app.homePage.messageTab.mentionPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I jump to conversation from AtMentions page should no UMI', async () => {
    await mentionsEntry.enter();
    await postMentionPage.postItemById(newPostId).jumpToConversationByClickPost();
  });

  await h(t).withLog('Then the conversation should have no UMI', async () => {
    await chatEntry.umi.shouldBeNumber(0);
  });

  await h(t).withLog('When I received new AtMention post in the conversation', async () => {
    await h(t).scenarioHelper.sendTextPost(`Just for UMI, ![:Person](${loginUser.rcId})`, chat, otherUser);
  });

  await h(t).withLog('Then the conversation should have 1 UMI', async () => {
    await chatEntry.umi.shouldBeNumber(1);
  });

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


test(formalName('Jump to post position when click button or clickable area of post.', ['P1', 'JPT-315', 'zack', 'AtMention']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    const otherUser = users[5];
    await h(t).platform(loginUser).init();
    await h(t).platform(otherUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

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
    });

    await h(t).withLog('And I click the post item', async () => {
      await postMentionPage.postItemById(atMentionTeamPostId).jumpToConversationByClickPost();
    });

    await h(t).withLog('Then I can see the AtMention post in the team', async () => {
      await t
        .expect(conversationPage.postItemById(atMentionTeamPostId).body.withText(verifyTextTeam).exists)
        .ok({ timeout: 5e3 });
    }, true);

    await h(t).withLog('When I back to AtMention page', async () => {
      await mentionsEntry.enter();
    });

    await h(t).withLog('And I click AtMention post item from pvChat', async () => {
      await postMentionPage.postItemById(atMentionChatPostId).clickConversationByButton();
    });

    await h(t).withLog('Then I can see the AtMention post in the pvChat', async () => {
      await t
        .expect(conversationPage.postItemById(atMentionChatPostId).body.withText(verifyTextChat).exists)
        .ok({ timeout: 5e3 });
    });
  });

test(formalName('JPT-733 Can\'t show all received posts when open mentions page', ['P2', 'JPT-733', 'Mia.Cai', 'AtMention']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[4];
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
    await t.expect(mentionPage.postItemById(newPostId).exists).notOk({ timeout: 10e3 });
  }, true);

});
