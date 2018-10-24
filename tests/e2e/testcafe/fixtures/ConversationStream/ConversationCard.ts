/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-12 16:29:39
* Copyright © RingCentral. All rights reserved.
*/
import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { GlipSdk } from '../../v2/sdk/glip';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';
import { ClientFunction } from 'testcafe';

declare var test: TestFn;
fixture('ConversationCard')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

const shouldMatchUrl = async (t: TestController) => {
  const getLocation = ClientFunction(() => window.location.href);
  const reg = /messages\/(\d+)/;
  const location = await getLocation();
  await t.expect(location).match(reg);
};

const getCurrentGroupIdFromURL = ClientFunction(() => {
  return Number(/messages\/(\d+)/.exec(window.location.href)[1]);
});

test(
  formalName('Check send time for each message metadata.', [
    'JPT-43',
    'P2',
    'ConversationStream',
  ]),
  async (t: TestController) => {
    const postContent = `some random text post ${Date.now()}`;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[0];
    const glipSDK: GlipSdk = await h(t).sdkHelper.sdkManager.getGlip(user);
    const format = 'hh:mm A';
    let groupId, postData, targetPost;

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${
      user.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog(
      `select any conversation`,
      async () => {
        const conversations = app.homePage.messagePanel.teamsSection.conversations;
        const count = await conversations.count;
        const n = Math.floor(Math.random() * count);
        await t.click(conversations.nth(n))
        await shouldMatchUrl;
        groupId = await getCurrentGroupIdFromURL();
      },
    );

    await h(t).withLog(`send one post to current group and check postId in conversation post id list`, async () => {
      postData = (await glipSDK.sendPost(groupId, postContent)).data;
      targetPost = app.homePage.messagePanel.conversationSection.posts.withAttribute('data-id', postData.id)
      await t.expect(targetPost.exists).ok(postData)
    })

    await h(t).withLog(`check time format on post, should have right format time in card'`, async () => {
      const formatTime = require('moment')(postData.creationTime).format(
        format,
      );
      const timeDiv = targetPost.find('div').withText(formatTime);
      await t.expect(timeDiv.exists).ok();
    })
  },
);

test(
  formalName(
    'When update user name, can sync dynamically in message metadata.',
    ['JPT-91', 'P2', 'ConversationStream'],
  ),
  async (t: TestController) => {
    const postContent = `some random text post ${Date.now()}`;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[0];
    const glipSDK: GlipSdk = await h(t).sdkHelper.sdkManager.getGlip(user);
    const changedName = `Random ${Date.now()}`;

    let groupId, postData, targetPost, userName;

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${
      user.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog(
      `select any conversation in team section`,
      async () => {
        const conversations = app.homePage.messagePanel.teamsSection.conversations;
        const count = await conversations.count;
        const n = Math.floor(Math.random() * count);
        await t.click(conversations.nth(n))
        await shouldMatchUrl;
        groupId = await getCurrentGroupIdFromURL();
      },
    );

    await h(t).withLog(`send one post to current group and check postId in conversation post id list`, async () => {
      postData = (await glipSDK.sendPost(groupId, postContent)).data;
      targetPost = app.homePage.messagePanel.conversationSection.posts.withAttribute('data-id', postData.id)
      await t.expect(targetPost.exists).ok(postData);
      userName = await targetPost.child(1).child(0).child(0).child(0).textContent;
      console.log(userName);
    })

    await h(t).withLog(`modify user name through api request and check username change to excepted`, async () => {
      await glipSDK.updatePerson(user.glipId, { first_name: changedName });
      await t.expect(targetPost.textContent).contains(changedName);
      await glipSDK.updatePerson(user.glipId, { first_name: userName });
    })
  },
);

test(
  formalName(
    'When update custom status, can sync dynamically in message metadata.',
    ['JPT-95', 'P2', 'ConversationStream'],
  ),
  async (t: TestController) => {
    const postContent = `some random text post JPT-95 ${Date.now()}`;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[0];
    const glipSDK: GlipSdk = await h(t).sdkHelper.sdkManager.getGlip(user);
    const changedName = `Random ${Date.now()}`;

    let groupId, postData, targetPost, userName;

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${
      user.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog(
      `select any conversation in team section`,
      async () => {
        const conversations = app.homePage.messagePanel.teamsSection.conversations;
        const count = await conversations.count;
        const n = Math.floor(Math.random() * count);
        await t.click(conversations.nth(n))
        await shouldMatchUrl;
        groupId = await getCurrentGroupIdFromURL();
      },
    );

    await h(t).withLog(`send one post to current group and check postId in conversation post id list`, async () => {
      postData = (await glipSDK.sendPost(groupId, postContent)).data;
      targetPost = app.homePage.messagePanel.conversationSection.posts.withAttribute('data-id', postData.id)
      await t.expect(targetPost.exists).ok(postData);
      userName = await targetPost.child(1).child(0).child(0).child(0).textContent;
      console.log(userName);
    })

    await h(t).withLog(`modify user status "In a meeting" through api request and check username display change to excepted`, async () => {
      await glipSDK.updatePerson(user.glipId, { away_status: `${userName} In a meeting` });
      await t.expect(targetPost.textContent).contains('In a meeting');
    })

    await h(t).withLog(`modify user status "content of user modify" through api request and check username display change to excepted`, async () => {
      await glipSDK.updatePerson(user.glipId, { away_status: `${userName} content of user modify` });
      await t.expect(targetPost.textContent).contains('content of user modify');
    })

    await h(t).withLog(`delete user status through api request and check username display change to excepted`, async () => {
      await glipSDK.updatePerson(user.glipId, { away_status: null });
      await t.expect(targetPost.textContent).notContains('content of user modify');
      await t.expect(targetPost.textContent).contains(userName);
    })
  },
);
