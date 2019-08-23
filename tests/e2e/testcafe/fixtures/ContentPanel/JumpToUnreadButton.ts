/*
 * @Author: Wayne.Zhou
 * @Date: 2018-12-24 15:35:54
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import * as _ from 'lodash';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from 'uuid';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('ContentPanel/JumpToUnreadButton')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

// TODO JPT-208 always failed when run with selenium
test.skip(formalName('Unread button will disappear when resizing window then full screen can show all new messages', ['JPT-208', 'P2', 'Wayne.Zhou', 'Stream']), async (t) => {
  if (await H.isElectron() || await H.isEdge()) {
    await h(t).log('This case (resize) is not working on Electron or Edge!');
    return;
  }

  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have an extension with one conversation named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('And ensured unread message in the conversation', async () => {
    const msgs = _.range(4);
    for (let msg of msgs) {
      await h(t).scenarioHelper.sentAndGetTextPostId(`${msg} ${uuid()}`, team, otherUser);
    }
  });

  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I resize window size`, async () => {
    await t.resizeWindow(1280, 360)
  });

  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I should see unread button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I maximize the window', async () => {
    await t.resizeWindow(1280, 720);
  });

  await h(t).withLog('Then I should not see unread button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk()
  });
});

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-211'],
  maintainers: ['Wayne.Zhou'],
  keywords: ['unreadButton']
})('Click the unread button (up) then jump to first unread post', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have an extension with one 1:1 conversation chat with {extension} and one conversation named: {teamName}`, async (step) => {
    step.initMetadata({
      extension: otherUser.extension,
      teamName: team.name
    });
    await h(t).scenarioHelper.createTeamsOrChats([chat, team]);
  });

  await h(t).withLog(`And set last group is me chat`, async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).setLastGroupIdIsMeChatId();
  });


  await h(t).withLog('And has one old message in 1:1 conversation chat', async () => {
    await h(t).scenarioHelper.sendTextPost('initial message', chat, loginUser);
    await h(t).glip(loginUser).markAsRead([chat.glipId]);
  });

  let postIdOfFirstUnreadInChat, postIdOfFirstUnreadInTeam;
  await h(t).withLog(`And both conversations have more one screen unread messages`, async () => {
    postIdOfFirstUnreadInChat = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), chat, otherUser);
    postIdOfFirstUnreadInTeam = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, otherUser);
    for (const i of _.range(3)) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), chat, otherUser);
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, otherUser);
    }
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const directMessageSection = app.homePage.messageTab.directMessagesSection;

  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('And enter the chat conversation', async () => {
    await directMessageSection.conversationEntryById(chat.glipId).enter();
  });

  await h(t).withLog('Then I should see unread button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I click jump to first unread button', async () => {
    await conversationPage.clickJumpToFirstUnreadButton();
  });

  await h(t).withLog('Then I should see the first post', async () => {
    await conversationPage.postByIdExpectVisible(postIdOfFirstUnreadInChat, true);
  });

  await h(t).withLog('And should see New messages indicator on the top', async () => {
    await t.expect(conversationPage.newMessageDeadLine.exists).ok();
    await conversationPage.newMessageDeadLineExpectVisible(true);
    await conversationPage.newMessageDeadLineShouldBeOnTheTop();
  });

  await h(t).withLog('When I enter the new team conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('Then I should see unread button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I click jump to first unread button', async () => {
    await conversationPage.clickJumpToFirstUnreadButton();
  });

  await h(t).withLog('Then I should see the first post on the top', async () => {
    await conversationPage.postCardByIdShouldBeOnTheTop(postIdOfFirstUnreadInTeam);
  });

  await h(t).withLog('And the "new Messages indicator" does not exists', async () => {
    await t.expect(conversationPage.newMessageDeadLine.exists).notOk();
  });
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-212'],
  maintainers: ['Wayne.Zhou'],
  keywords: ['unreadButton']
})('The count of the unread button (up) should display correct', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  const umiCount = 4;
  const msgList = _.range(umiCount).map(i => H.multilineString(10, `No. ${i}`, uuid()));

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have an extension with one conversation named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('And has old message in it', async () => {
    await h(t).scenarioHelper.sentAndGetTextPostId('initial message', team, loginUser);
  });

  await h(t).withLog(`And has ${msgList.length} unread messages`, async () => {
    for (const msg of msgList) {
      await h(t).scenarioHelper.sentAndGetTextPostId(msg, team, otherUser);
    }
  });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And enter the conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog(`Then I should see unread button with unread count ${umiCount}`, async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
    await conversationPage.countOnUnreadButtonShouldBe(umiCount);
  }, true);
});

// JPT-225 deprecated, should be convert to MT
test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ["JPT-699", "JPT-255"],
  keywords: ["Stream", "UnreadButton", "HighCost"],
  maintainers: ["Wayne.Zhou", "Potar.He"]
})('JPT-699 The count of the unread button (up) should show "99+" when post more than 99. & JPT-225 All unread messages can be downloaded when click the unread button', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have an extension with one conversation named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const msgList = _.range(99).map(i => `${i} ${uuid()}`);
  let firstUnreadPostId;
  await h(t).withLog('And this conversation has 100 unread messages for me', async () => {
    const firstPost = `first post`
    firstUnreadPostId = await h(t).scenarioHelper.sentAndGetTextPostId(firstPost, team, otherUser);
    for (let msg of msgList) {
      await h(t).scenarioHelper.sendTextPost(msg, team, otherUser);
    }
    msgList.unshift(firstPost);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And enter the team conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
  });

  await h(t).withLog('Then I should see unread button with unread count 99+', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok();
    await conversationPage.countOnUnreadButtonShouldBe('99+');
  });

  await h(t).withLog('When I click jump to first unread button', async () => {
    await conversationPage.clickJumpToFirstUnreadButton();
  });

  await h(t).withLog('Then I should see the first post on the top', async () => {
    await conversationPage.postCardByIdShouldBeOnTheTop(firstUnreadPostId);
  });

  await h(t).withLog('And the "new Messages indicator" does not exists', async () => {
    await t.expect(conversationPage.newMessageDeadLine.exists).notOk();
  });

  await h(t).withLog('Then the messages should be loaded', async () => {
    await conversationPage.scrollDownToCheckPostInOrder(msgList, 20);
  });
})

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-234'],
  maintainers: ['Wayne.Zhou'],
  keywords: ['unreadButton']
})('Unread button (up) will dismiss when back and open the conversation', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let teamA = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let teamB = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with two conversation A and B', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([teamA, teamB]);
  });

  await h(t).withLog('And conversationA has more than 1 screen unread messages', async () => {
    const msgList = _.range(5).map(i => H.multilineString(10, `No. ${i}`, uuid()));
    for (const msg of msgList) {
      await h(t).scenarioHelper.sentAndGetTextPostId(msg, teamA, otherUser);
    }
  })

  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog(`And I enter conversationA named ${teamA.name}`, async () => {
    await teamsSection.conversationEntryById(teamA.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I should see unread button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I navigate to conversationB then back to conversationA', async () => {
    await teamsSection.conversationEntryById(teamB.glipId).enter();
    await teamsSection.conversationEntryById(teamA.glipId).enter();
  });

  await h(t).withLog('Then I should not see unread button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk()
  });
})

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1212'],
  maintainers: ['Mia.Cai'],
  keywords: ['unreadButton']
})(`The unread button (up) shouldn't dismiss when opening one conversation with more than 1 screen unread posts then send one post`, async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have an extension with one conversation named ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('And conversationA has more than 1 screen unread messages', async () => {
    const msgList = _.range(5).map(i => H.multilineString(10, `No. ${i}`, uuid()));
    for (const msg of msgList) {
      await h(t).scenarioHelper.sentAndGetTextPostId(msg, team, otherUser);
    }
  })

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I should see unread button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
  });

  const newMessage = uuid();
  await h(t).withLog('When I send one message to this conversation', async () => {
    await conversationPage.sendMessage(newMessage);
  });

  await h(t).withLog('Then I can read this message from post list', async () => {
    await t.expect(conversationPage.nthPostItem(-1).body.withText(newMessage).exists).ok();
  }, true);

  await h(t).withLog(`And the unread button shouldn't dismiss`, async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1893'],
  maintainers: ['Potar.He'],
  keywords: ['UnreadButton', 'HighCost']
})('Click the unread button (up) then jump to first unread post for some edge cases', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  const unreadCounts = [19, 20, 21];

  const teams = Array.from({ length: unreadCounts.length }, (x, i) => <IGroup>{
    name: `${unreadCounts[i]}-${uuid()}`,
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  })

  await h(t).withLog(`Given I have an extension with {count} conversations`, async (step) => {
    step.setMetadata('count', teams.length.toString());
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();
    await h(t).scenarioHelper.createTeamsOrChats(teams);
  });

  let firstUnreadPostIds = [];
  await h(t).withLog(`And both conversations have more one screen unread messages`, async () => {
    for (const team of teams) {
      firstUnreadPostIds.push(await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, otherUser));
    }
    for (const i in unreadCounts) {
      for (const j of _.range(unreadCounts[i] - 1)) {
        await h(t).scenarioHelper.sendTextPost(uuid(), teams[i], otherUser);
      }
    }
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;

  const conversationPage = app.homePage.messageTab.conversationPage;

  for (const i in teams) {
    await h(t).withLog('When I enter the new team conversation with {umi} Umi', async (step) => {
      step.setMetadata('umi', unreadCounts[i].toString());
      await teamsSection.conversationEntryById(teams[i].glipId).enter();
    });

    await h(t).withLog('Then I should see unread button', async () => {
      await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
    });

    await h(t).withLog(`Then I should see unread button with unread count {umi}`, async (step) => {
      step.setMetadata('umi', unreadCounts[i].toString());
      await conversationPage.countOnUnreadButtonShouldBe(unreadCounts[i]);
    });

    await h(t).withLog('When I click jump to first unread button', async () => {
      await conversationPage.clickJumpToFirstUnreadButton();
    });

    await h(t).withLog('Then I should see the first post on the top', async () => {
      await conversationPage.postCardByIdShouldBeOnTheTop(firstUnreadPostIds[i]);
    });

    await h(t).withLog('And the "new Messages indicator" does not exists', async () => {
      await t.expect(conversationPage.newMessageDeadLine.exists).notOk();
    });
  }

  await h(t).withLog('Given I enter other conversation except these', async () => {
    await app.homePage.messageTab.favoritesSection.nthConversationEntry(0).enter();
  });

  firstUnreadPostIds = [];
  await h(t).withLog(`And both conversations have more one screen unread messages`, async () => {
    for (const team of teams) {
      firstUnreadPostIds.push(await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, otherUser));
    }
    for (const i in unreadCounts) {
      for (const j of _.range(unreadCounts[i] - 1)) {
        await h(t).scenarioHelper.sendTextPost(uuid(), teams[i], otherUser);
      }
    }
  });

  for (const i in teams) {
    await h(t).withLog('When I enter the new team conversation with {umi} Umi', async (step) => {
      step.setMetadata('umi', unreadCounts[i].toString());
      await teamsSection.conversationEntryById(teams[i].glipId).enter();
    });

    await h(t).withLog('Then I should see unread button', async () => {
      await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
    });

    await h(t).withLog('Then I should see unread button with unread count: {umi}', async (step) => {
      step.setMetadata('umi', unreadCounts[i].toString());
      await conversationPage.countOnUnreadButtonShouldBe(unreadCounts[i]);
    });

    await h(t).withLog('When I click jump to first unread button', async () => {
      await conversationPage.clickJumpToFirstUnreadButton();
    });

    await h(t).withLog('Then I should see the first post', async () => {
      await conversationPage.postByIdExpectVisible(firstUnreadPostIds[i], true);
    });

    await h(t).withLog('And should see New messages indicator on the top', async () => {
      await t.expect(conversationPage.newMessageDeadLine.exists).ok();
      await conversationPage.newMessageDeadLineExpectVisible(true);
      await conversationPage.newMessageDeadLineShouldBeOnTheTop();
    });
  }

});
