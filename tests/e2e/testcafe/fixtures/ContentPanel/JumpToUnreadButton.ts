/*
 * @Author: Wayne.Zhou
 * @Date: 2018-12-24 15:35:54
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import * as _ from 'lodash';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from 'uuid';
import { ClientFunction } from 'testcafe';

fixture('ContentPanel/JumpToUnreadButton')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Unread button will disappear when resizing window then full screen can show all new messages', ['JPT-208', 'P2','Wayne.Zhou', 'Stream']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[6];
  const userPlatform = await h(t).getPlatform(user);
  const anotherUserPlatform = await h(t).getPlatform(users[5])
  let conversation;

  await h(t).withLog('Given I have an extension with one conversation', async () => {
    conversation = (await userPlatform.createGroup({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [user.rcId, users[5].rcId, users[6].rcId],
    })).data.id;
  });

  await h(t).withLog('And another user send 10 message in the conversation',
    async ()=>{
      const msgs = _.range(10)
      for (let msg of msgs){
        await anotherUserPlatform.createPost({text: `${msg} ${uuid()}`}, conversation)
      }
    }
  )

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I resize window size`,
    async () => {
      await t.resizeWindow(1920, 500)
    }
  )

  await h(t).withLog('When I enter the conversation',
    async () => {
      const teamsSection = app.homePage.messageTab.teamsSection;
      await teamsSection.expand();
      await teamsSection.conversationEntryById(conversation).enter();
      await teamsSection.ensureLoaded();
    });

  await h(t).withLog('Then I should see unread button',
    async () => {
      const conversationPage = app.homePage.messageTab.conversationPage;
      await t.wait(3e3);
      await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
    }
  );

  await h(t).withLog('When I maximize the window',
    async ()=>{
      await t.maximizeWindow()
    }
  )

  await h(t).withLog('Then I should not see unread button',
    async () => {
      await t.wait(3e3);
      const conversationPage = app.homePage.messageTab.conversationPage;
      await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk()
    }
  );
})

test(formalName('Click the unread button (up) then jump to first unread post', ['JPT-211', 'P0','Wayne.Zhou','Stream']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[6];
  const userPlatform = await h(t).getPlatform(user);
  const anotherUserPlatform = await h(t).getPlatform(users[5])
  const isVisible = ClientFunction(selector =>{
      const bounding = selector().getBoundingClientRect()
      return (
          bounding.top + 10 >= 0 &&
          bounding.left >= 0 &&
          bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
 })

  let teamA;
  let teamB;
  let msgList = _.range(30).map(i => `${i} ${uuid()}`);

  await h(t).withLog('Given I have an extension with 2 team chat', async () => {
    teamA = (await userPlatform.createGroup({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [user.rcId, users[5].rcId, users[6].rcId],
    })).data.id;

    teamB = (await userPlatform.createGroup({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [user.rcId, users[5].rcId, users[6].rcId],
    })).data.id;

  });

  await h(t).withLog('And I send a message in teamA',
    async ()=>{
      await userPlatform.createPost({text:'initial message'}, teamA);
    }
  )

  await h(t).withLog('And teamA and teamB has unread messages',
    async ()=>{
      for(let msg of msgList){
        await anotherUserPlatform.createPost({text: msg}, teamA)
        await anotherUserPlatform.createPost({text: msg}, teamB)
      }
    }
  );

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('And enter the teamA conversation',
    async () => {
      await teamsSection.expand();
      await teamsSection.conversationEntryById(teamA).enter();
      await teamsSection.ensureLoaded();
    });

  await h(t).withLog('Then I should see unread button',
    async () => {
      const conversationPage = app.homePage.messageTab.conversationPage;
      await t.wait(3e3);
      await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
    }
  );

  await h(t).withLog('When I click jump to first unread button',
    async () => {
      const conversationPage = app.homePage.messageTab.conversationPage;
      await conversationPage.clickJumpToFirstUnreadButton();
      await t.wait(3e3);
    }
  )

  await h(t).withLog('Then I should see the first post',
    async ()=>{
      const posts = await app.homePage.messageTab.conversationPage.posts;
      await t.expect(isVisible(await posts.nth(-msgList.length))).ok();
      await t.expect(posts.nth(-msgList.length).withText(msgList[0]).exists).ok();
    }
  )

  await h(t).withLog('And New Messages indicator exist',
    async ()=>{
      await t.expect(app.homePage.messageTab.conversationPage.stream.find('span').withText('New Messages').exists).ok()
    }
  )

  // TODO: enable after FIJI-2466 resolved
  // await h(t).withLog('When I enter the teamB conversation',
  //   async () => {
  //     await teamsSection.expand();
  //     await teamsSection.conversationEntryById(teamB).enter();
  //     await teamsSection.ensureLoaded();
  //   });

  // await h(t).withLog('When I click jump to first unread button',
  //   async () => {
  //     const conversationPage = app.homePage.messageTab.conversationPage;
  //     await conversationPage.clickJumpToFirstUnreadButton();
  //   }
  // )

  // await h(t).withLog('Then I should see the first post',
  //   async ()=>{
  //     const posts = await app.homePage.messageTab.conversationPage.posts;
  //     await t.expect(isVisible(await posts.nth(-msgList.length))).ok();
  //     await t.expect(posts.nth(-msgList.length).withText(msgList[0]).exists).ok();
  //   }
  // )
});

test(formalName('The count of the unread button (up) should display correct', ['JPT-212', 'P1','Wayne.Zhou','Stream']), async (t) => {

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[6];
  const userPlatform = await h(t).getPlatform(user);
  const anotherUserPlatform = await h(t).getPlatform(users[5])

  let conversationA, conversationB;
  await h(t).withLog('Given I have an extension with 2 conversation', async () => {
    conversationA = (await userPlatform.createGroup({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [user.rcId, users[5].rcId, users[6].rcId],
    })).data.id;

    conversationB = (await userPlatform.createGroup({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [user.rcId, users[5].rcId, users[6].rcId],
    })).data.id;
 });

  async function sendMessage (conversationId, number){
    let msgs = _.range(number)
    for(let msg of msgs){
      await anotherUserPlatform.createPost({text: `${msg} ${uuid()}`}, conversationId)
    }
  }

  await h(t).withLog('And conversationA has 20 unread message',
    async ()=>{
      await sendMessage(conversationA, 20);
    }
  )

  await h(t).withLog('And conversationB has 100 unread message',
    async ()=>{
      await sendMessage(conversationB, 100);
    }
  )

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
  async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And enter conversationA',
    async () => {
      await teamsSection.expand();
      await teamsSection.conversationEntryById(conversationA).enter();
    });

  await h(t).withLog('Then I should see unread button with unread count 20',
    async () => {
      await t.wait(3e3)
      await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
      await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.find('span').withText('20').exists).ok()
    }
  );

  await h(t).withLog('When I enter conversationB',
    async ()=>{
      await teamsSection.conversationEntryById(conversationB).enter();
    }
  )

  await h(t).withLog('Then I should see unread button with unread count 99+',
    async () => {
      await t.wait(3e3)
      await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok()
      await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.find('span').withText('99+').exists).ok()
    }
  );
})

test(formalName('All unread messages can be downloaded when click the unread button', ['JPT-225', 'P2','Wayne.Zhou', 'Stream']), async (t) => {

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[6];
  const userPlatform = await h(t).getPlatform(user);
  const anotherUserPlatform = await h(t).getPlatform(users[5])

  let conversation;
  await h(t).withLog('Given I have an extension with a conversation', async () => {
    conversation = (await userPlatform.createGroup({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [user.rcId, users[5].rcId, users[6].rcId],
    })).data.id;
  });

  const msgList = _.range(100).map(i => `${i} ${uuid()}`);
  await h(t).withLog('And this conversation has 100 unread messages for me',
    async () => {
      for(let msg of msgList){
        await anotherUserPlatform.createPost({text: msg}, conversation)
      }
    }
  )

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('And enter the team conversation',
    async () => {
      await teamsSection.expand();
      await teamsSection.conversationEntryById(conversation).enter();
      await teamsSection.ensureLoaded();
    }
  );

  await h(t).withLog('And click jump to first unread button',
    async () => {
      await t.wait(3e3)
      await app.homePage.messageTab.conversationPage.clickJumpToFirstUnreadButton();
    }
  )

  await h(t).withLog('Then the messages should be loaded',
    async () => {
      const posts = await app.homePage.messageTab.conversationPage.posts;
      for (let i = 0; i < msgList.length; i++) {
        await t.expect(posts.nth(-msgList.length + i).withText(msgList[i]).exists).ok();
      }
    }
  )
})

