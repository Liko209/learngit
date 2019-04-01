/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-13 13:26:25
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-12 20:06:23
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

  await h(t).withLog('When the sender delete the new post', async () => {
    await h(t).glip(otherUser).init();
    await h(t).glip(otherUser).deletePost(newPostId, chat.glipId);
  });

  await h(t).withLog('Then the last at mention post should not exist in mentions page', async () => {
    await t.expect(mentionPage.postItemById(newPostId).exists).notOk({ timeout: 10e3 });
  }, true);
});

test(formalName('Jump to conversation bottom when click name and conversation show in the top of conversation list', ['P2', 'JPT-314']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }
  let group = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser, users[7]]
  }
  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog('Given I have an extension with 3 different types of conversations and each has a post with mention', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat, group, team]);
  });

  let postIds = []
  const mentionGroups = [chat, group, team];
  await h(t).withLog(`And and each has a post with mention`, async () => {
    for (const mentionGroup of mentionGroups) {
      const postId = await h(t).scenarioHelper.sentAndGetTextPostId(`Hi, ![:Person](${loginUser.rcId})`, mentionGroup, otherUser);
      postIds.push(postId)
    }
  });

  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const mentionsEntry = app.homePage.messageTab.mentionsEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('Then I can find 3 posts in the mentions page', async () => {
    await mentionsEntry.enter();
    await t.expect(mentionPage.posts.count).gte(3);
    for (const postId of postIds) {
      await t.expect(mentionPage.postItemById(postId).exists).ok();
    }
  }, true);

  for (const i of _.range(postIds.length)) {
    let conversationName;
    await h(t).withLog(`When I enter mentions page`, async () => {
      await mentionsEntry.enter();
      conversationName = await mentionPage.postItemById(postIds[i]).conversationName.textContent
    });

    await h(t).withLog(`and I click the conversation name ${conversationName} in one conversation card`, async () => {
      await mentionPage.postItemById(postIds[i]).jumpToConversationByClickName();
    });

    await h(t).withLog('And should jump to the chat page and scroll to bottom', async () => {
      await conversationPage.groupIdShouldBe(mentionGroups[i].glipId);
      await conversationPage.expectStreamScrollToBottom();
    });
  }
});

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

  await h(t).withLog('When I enter AtMention page', async () => {
    await mentionsEntry.enter();
  }, true);


  await h(t).withLog('Then I should find the AtMention posts', async () => {
    await t.expect(mentionPage.postItemById(postId).exists).ok()
  });

  await h(t).withLog('And the UMI should exist', async () => {
    await directMessagesSection.fold();
    await directMessagesSection.headerUmi.shouldBeNumber(1);
  })

  await h(t).withLog('When I click the post and jump to the conversation', async () => {
    await mentionPage.postItemById(postId).hoverPostAndClickJumpToConversationButton();
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
    await postMentionPage.postItemById(newPostId).hoverPostAndClickJumpToConversationButton();
  });

  await h(t).withLog('Then the at mention post should be visible', async () => {
    await conversationPage.groupIdShouldBe(chat.glipId);
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.postByIdExpectVisible(newPostId, true);
  });

  await h(t).withLog('And the conversation should have no UMI', async () => {
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

test(formalName('Jump to post position when click button or clickable area of post.[AtMention]', ['P1', 'JPT-315', 'zack', 'AtMention']), async (t: TestController) => {
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
  await h(t).withLog('Given I have 1 AtMention post in team ,one in group.(out of screen)', async () => {
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
  });

  const app = new AppRoot(t);
  const mentionsEntry = app.homePage.messageTab.mentionsEntry;
  const postMentionPage = app.homePage.messageTab.mentionPage;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  for (const i in conversations) {
    await h(t).withLog('When I enter AtMentions page', async () => {
      await mentionsEntry.enter();
    });

    await h(t).withLog(`And I click the ${conversations[i].type} post. (except team name)`, async () => {
      await postMentionPage.postItemById(postIds[i]).clickSelf();
    });

    await h(t).withLog('Then No response after clicking', async () => {
      await mentionsEntry.ensureLoaded();
      await postMentionPage.postItemById(postIds[i]).ensureLoaded();
    }, true);

    await h(t).withLog('When I hover the at mention post then click button - "Jump to conversation"', async () => {
      await postMentionPage.postItemById(postIds[i]).hoverPostAndClickJumpToConversationButton();
    });

    await h(t).withLog(`Then I should jump to the AtMention post position in the team `, async () => {
      await conversationPage.waitUntilPostsBeLoaded();
      await conversationPage.groupIdShouldBe(conversations[i].glipId);
      await conversationPage.postCardByIdShouldBeOnTheTop(postIds[i]);
    });

    await h(t).withLog('And this post will be highlighted', async () => {
      await conversationPage.postItemById(postIds[i]).shouldBeHighLight();
    });
  }
});

test(formalName('JPT-733 Can\'t show all received posts when open mentions page', ['P2', 'JPT-733', 'Mia.Cai', 'AtMention']), async (t: TestController) => {
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

  await h(t).withLog('And I open mentions page', async () => {
    await app.homePage.messageTab.mentionsEntry.enter();
  });

  let newPostId;
  await h(t).withLog('And I received new message', async () => {
    await h(t).platform(otherUser).init();
    newPostId = await h(t).platform(otherUser).sentAndGetTextPostId(uuid(), chat.glipId);
  });

  await h(t).withLog('Then I can\'t find the posts in the mentions page', async () => {
    const mentionPage = app.homePage.messageTab.mentionPage;
    await t.expect(mentionPage.postItemById(newPostId).exists).notOk({ timeout: 10e3 });
  }, true);

});
