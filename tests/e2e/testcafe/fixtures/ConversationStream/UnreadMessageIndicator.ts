/*
 * @Author: Potar.He 
 * @Date: 2019-06-21 16:04:06 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-06-25 16:53:57
 */

import { setupCase, teardownCase } from '../../init';
import { h, H } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';
import { v4 as uuid } from 'uuid';

fixture('unreadMessageIndicator')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase())


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-219'],
  maintainers: ['potar.he'],
  keywords: ['unreadMessageIndicator']
})(`Shouldn't display unread message indicator when user stay in the bottom of a conversation.`, async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have a chat`, async () => {
    await h(t).scenarioHelper.resetProfileAndState(loginUser);
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  const app = new AppRoot(t);
  await h(t).withLog('And I set new_message_badges is all', async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).setNewMessageBadges('all');
  });


  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter the chat conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('Then conversation page should be scroll to bottom', async () => {
    await conversationPage.expectStreamScrollToBottom();
  });

  await h(t).withLog('When I receive a new message in this conversation', async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, otherUser);
  });

  await h(t).withLog(`Then Doesn't display the Unread Message Indicator`, async () => {
    await t.expect(conversationPage.newMessageDeadLine.exists).notOk();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-220'],
  maintainers: ['potar.he'],
  keywords: ['unreadMessageIndicator']
})(`Display unread message indicator when user doesn't stay in the bottom of a conversation.`, async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have a new team: {name}`, async (step) => {
    step.setMetadata('name', team.name)
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And there are more one page message`, async () => {
    for (var i = 0; i < 5; i++) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, loginUser);
    };
  })

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter the team conversation', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('Then conversation page should be scroll to bottom', async () => {
    await conversationPage.expectStreamScrollToBottom();
  });

  await h(t).withLog('When I scroll to middle to ensure not stay at the bottom', async () => {
    await conversationPage.scrollToMiddle();
  });

  await h(t).withLog('And I receive a new message in this conversation', async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), team, otherUser);
  });

  await h(t).withLog('And I scroll to bottom', async () => {
    await conversationPage.scrollToBottom();
  });

  await h(t).withLog(`Then display the Unread Message Indicator`, async () => {
    await t.expect(conversationPage.newMessageDeadLine.exists).ok();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-221'],
  maintainers: ['potar.he'],
  keywords: ['unreadMessageIndicator']
})(`Shouldn't display unread message indicator if user mark as unread a conversation.`, async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have a chat with at least post`, async () => {
    await h(t).scenarioHelper.resetProfileAndState(loginUser);
    await h(t).scenarioHelper.createOrOpenChat(chat);
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, otherUser);
    await h(t).glip(loginUser).markAsRead([chat.glipId]);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversation = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId)
  await h(t).withLog('When I mark as Unread this chat', async () => {
    await conversation.openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.enter();
    await t.hover('html');
  });

  await h(t).withLog('Then Umi should be 1', async () => {
    await conversation.umi.shouldBeNumber(1)
  });

  await h(t).withLog('When I enter the chat conversation', async () => {
    await conversation.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('Then conversation page should be scroll to bottom', async () => {
    await conversationPage.expectStreamScrollToBottom();
  });

  await h(t).withLog('When I receive a new message in this conversation', async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, otherUser);
  });

  await h(t).withLog(`Then Doesn't display the Unread Message Indicator`, async () => {
    await t.expect(conversationPage.newMessageDeadLine.exists).notOk();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-258'],
  maintainers: ['potar.he'],
  keywords: ['unreadMessageIndicator']
})(`Shouldn't display unread message indicator if new messages are the first post of the conversation.`, async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have a new team: {name}`, async (step) => {
    step.setMetadata('name', team.name)
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And there is a umi in the team`, async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), team, otherUser);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter the team conversation', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`Then Doesn't display the Unread Message Indicator`, async () => {
    await t.expect(conversationPage.newMessageDeadLine.exists).notOk();
  });
});