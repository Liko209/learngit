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
import { IGroup } from '../../v2/models';

fixture('ContentPanel/JumpToUnreadButton')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Unread button will disappear when resizing window then full screen can show all new messages', ['JPT-208', 'P2', 'Wayne.Zhou', 'Stream']), async (t) => {
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
    await teamsSection.expand();
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

test(formalName('Click the unread button (up) then jump to first unread post', ['JPT-211', 'P0', 'Wayne.Zhou', 'Stream']), async (t) => {
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

  await h(t).withLog('And has one  old message in it', async () => {
    await h(t).scenarioHelper.sendTextPost('initial message', team, loginUser);
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).markAsRead([team.glipId]);
  });

  let firstUnreadPostId;
  await h(t).withLog(`And has more one screen unread messages`, async () => {
    firstUnreadPostId = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, otherUser);
    for (const i of _.range(3)) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, otherUser);
    }
  });

  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('And enter the teamA conversation', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(team.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  await h(t).withLog('Then I should see unread button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I click jump to first unread button', async () => {
    await conversationPage.clickJumpToFirstUnreadButton();
  });

  await h(t).withLog('Then I should see the first post', async () => {
    await conversationPage.postByIdExpectVisible(firstUnreadPostId, true);
  });

  await h(t).withLog('And should see New Messages indicator on the top', async () => {
    await t.expect(conversationPage.newMessageDeadLine.exists).ok();
    await conversationPage.newMessageDeadLineExpectVisible(true);
    await conversationPage.newMessageDeadLineShouldBeOnTheTop();
  });

});

test(formalName('The count of the unread button (up) should display correct', ['JPT-212', 'P1', 'Wayne.Zhou', 'JumpToUnreadButton']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  const umiCount = 3;
  const msgList = _.range(umiCount).map(i => H.multilineString());

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
    await teamsSection.expand();
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog(`Then I should see unread button with unread count ${umiCount}`, async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
    await conversationPage.countOnUnreadButtonShouldBe(umiCount);
  }, true);
});

// JPT-225 deprecated, should be convert to MT
test.skip(formalName('JPT-699 The count of the unread button (up) should show "99+" when post more than 99. \
JPT-225 All unread messages can be downloaded when click the unread button', ['JPT-225', 'JPT-699', 'P2', 'Wayne.Zhou', 'Stream']), async (t) => {
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

    const msgList = _.range(100).map(i => `${i} ${uuid()}`);
    await h(t).withLog('And this conversation has 100 unread messages for me', async () => {
      for (let msg of msgList) {
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
    await h(t).withLog('And enter the team conversation', async () => {
      await teamsSection.expand();
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

    await h(t).withLog('Then the messages should be loaded', async () => {
      await conversationPage.historyPostsDisplayedInOrder(msgList);
    });
  })

test(formalName('Unread button (up) will dismiss when back and open the conversation', ['JPT-234', 'P1', 'Wayne.Zhou', 'Stream']), async (t) => {
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
    await teamsSection.expand();
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

test(formalName(`The unread button (up) shouldn't dismiss when opening one conversation with more than 1 screen unread posts then send one post`, ['JPT-1212', 'P2', 'Mia.Cai', 'JumpToUnreadButton']), async (t) => {
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
    await teamsSection.expand();
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
