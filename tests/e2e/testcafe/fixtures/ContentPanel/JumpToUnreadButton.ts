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

fixture('ContentPanel/JumpToUnreadButton')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Unread button will disappear when resizing window then full screen can show all new messages', ['JPT-208', 'P2', 'Wayne.Zhou', 'Stream']), async (t) => {
  if (await H.isElectron() || await H.isEdge()) {
    await h(t).log('This case (resize) is not working on Electron or Edge!');
    return;
  }

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];
  await h(t).platform(loginUser).init();
  await h(t).platform(otherUser).init();

  let conversation;
  await h(t).withLog('Given I have an extension with one conversation', async () => {
    conversation = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId, users[6].rcId],
    });
  });

  await h(t).withLog('And another user send 10 message in the conversation', async () => {
    const msgs = _.range(5)
    for (let msg of msgs) {
      await h(t).platform(otherUser).createPost({ text: `${msg} ${uuid()}` }, conversation);
    }
  });

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
    await teamsSection.conversationEntryById(conversation).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I should see unread button', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I maximize the window', async () => {
    await t.resizeWindow(1280, 720);
  });

  await h(t).withLog('Then I should not see unread button', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk()
  });
});

test(formalName('Click the unread button (up) then jump to first unread post', ['JPT-211', 'P0', 'Wayne.Zhou', 'Stream']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];
  await h(t).platform(loginUser).init();
  await h(t).platform(otherUser).init();

  let teamA, teamB, msgList = _.range(30).map(i => `${i} ${uuid()}`);
  await h(t).withLog('Given I have an extension with 2 team chat', async () => {
    teamA = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId, users[6].rcId],
    });

    teamB = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId, users[6].rcId],
    });

  });

  await h(t).withLog('And I send a message in teamA', async () => {
    await h(t).platform(loginUser).createPost({ text: 'initial message' }, teamA);
  });

  await h(t).withLog('And teamA and teamB has unread messages', async () => {
    for (let msg of msgList) {
      await h(t).platform(otherUser).createPost({ text: msg }, teamA)
      await h(t).platform(otherUser).createPost({ text: msg }, teamB)
    }
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And enter the teamA conversation', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(teamA).enter();
    await teamsSection.ensureLoaded();
  });

  await h(t).withLog('Then I should see unread button', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I click jump to first unread button', async () => {
    ;
    await conversationPage.clickJumpToFirstUnreadButton();
  });

  await h(t).withLog('Then I should see the first post', async () => {
    const postItem = conversationPage.nthPostItem(-msgList.length);
    await conversationPage.nthPostExpectVisible(-msgList.length);
    await t.expect(postItem.text.withText(msgList[0]).exists).ok();
  });

  await h(t).withLog('And New Messages indicator exist and can not be seen', async () => {
    await t.expect(conversationPage.newMessageDeadLine.exists).ok();
    await conversationPage.newMessageDeadLineExpectVisible(false);
  });

  // TODO: enable after FIJI-2466 resolved
  // await h(t).withLog('When I enter the teamB conversation',
  //   async () => {
  //   });

  // await h(t).withLog('When I click jump to first unread button',
  //   async () => {
  //   }
  // )

  // await h(t).withLog('Then I should see the first post',
  //   async ()=>{
  //   }
  // )
});

test(formalName('The count of the unread button (up) should display correct', ['JPT-212', 'P1', 'Wayne.Zhou', 'JumpToUnreadButton']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];
  await h(t).platform(loginUser).init();
  await h(t).platform(otherUser).init();

  let teamId;
  await h(t).withLog('Given I have an extension with 1 conversation', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId, users[6].rcId],
    });
  });

  await h(t).withLog('And the conversation has 20 unread message', async () => {
    for (const i of _.range(20)) {
      await h(t).platform(otherUser).createPost({ text: `${i} ${uuid()}` }, teamId);
    }
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And enter the conversation', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog('Then I should see unread button with unread count 20', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.find('span').withText('20').exists).ok()
  });
});


test(formalName('The count of the unread button (up) should show 99+ when post more than 99.', ['JPT-699', 'P2', 'Potar.He', 'JumpToUnreadButton']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];
  await h(t).platform(otherUser).init();

  let teamId;
  await h(t).withLog('Given I have an extension with 1 conversation', async () => {
    teamId = await h(t).platform(otherUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId],
    });
  });

  await h(t).withLog('And the conversation has 100 unread message', async () => {
    for (const i of _.range(100)) {
      await h(t).platform(otherUser).createPost({ text: `${i} ${uuid()}` }, teamId);
    }
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('When I enter the conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  })

  await h(t).withLog('Then I should see unread button with unread count 99+', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok();
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.find('span').withText('99+').exists).ok()
  });
});

test(formalName('All unread messages can be downloaded when click the unread button', ['JPT-225', 'P2', 'Wayne.Zhou', 'Stream']), async (t) => {

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];
  await h(t).platform(loginUser).init();
  await h(t).platform(otherUser).init();

  let conversation;
  await h(t).withLog('Given I have an extension with a conversation', async () => {
    conversation = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId, users[6].rcId],
    });
  });

  const msgList = _.range(100).map(i => `${i} ${uuid()}`);
  await h(t).withLog('And this conversation has 100 unread messages for me', async () => {
    for (let msg of msgList) {
      await h(t).platform(otherUser).createPost({ text: msg }, conversation)
    }
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('And enter the team conversation', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(conversation).enter();
    await teamsSection.ensureLoaded();
  });

  await h(t).withLog('And click jump to first unread button', async () => {
    await t.wait(8e3)
    await app.homePage.messageTab.conversationPage.clickJumpToFirstUnreadButton();
  });

  await h(t).withLog('Then the messages should be loaded', async () => {
    const posts = await app.homePage.messageTab.conversationPage.posts;
    for (let i = 0; i < msgList.length; i++) {
      await t.expect(posts.nth(-msgList.length + i).withText(msgList[i]).exists).ok();
    }
  });
})

test(formalName('Unread button (up) will dismiss when back and open the conversation', ['JPT-234', 'P1', 'Wayne.Zhou', 'Stream']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];
  await h(t).platform(loginUser).init();
  await h(t).platform(otherUser).init();
  let conversationA;
  let conversationB;

  await h(t).withLog('Given I have an extension with two conversation', async () => {
    conversationA = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId, users[6].rcId],
    });

    conversationB = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId, users[6].rcId],
    });
  });

  await h(t).withLog('And another user send 20 message in conversationA', async () => {
    const msgs = _.range(20)
    for (let msg of msgs) {
      await h(t).platform(otherUser).createPost({ text: `${msg} ${uuid()}` }, conversationA)
    }
  })

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('And I enter conversationA', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(conversationA).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I should see unread button', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I navigate to conversationB then back to conversationA', async () => {
    await teamsSection.conversationEntryById(conversationB).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await teamsSection.conversationEntryById(conversationA).enter();
  });

  await h(t).withLog('Then I should not see unread button', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk()
  });
})
