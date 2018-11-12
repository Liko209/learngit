/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-12 16:29:39
* Copyright © RingCentral. All rights reserved.
*/
import * as moment from 'moment';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { h, H } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('ConversationCard')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());


test(formalName('Check send time for each message metadata.', ['JPT-43', 'P2', 'ConversationStream']),
  async (t: TestController) => {
    const postContent = `some random text post on ${Date.now()}`;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    const userPlatform = await h(t).getPlatform(user);
    const format = 'hh:mm A';

    let groupId, postData, targetPost;
    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      await userPlatform.createGroup({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog(`Then I enter a random conversation in teams section`, async () => {
      const conversations = app.homePage.messagePanel.teamsSection.conversations;
      const count = await conversations.count;
      const n = Math.floor(Math.random() * count);
      await app.homePage.messagePanel.teamsSection.nthConversationEntry(n).enter();
      groupId = await app.homePage.messagePanel.getCurrentGroupIdFromURL();
    });

    await h(t).withLog(`When I send one post to current conversation`, async () => {
      postData = (await userPlatform.createPost({ text: postContent }, groupId)).data;
      targetPost = app.homePage.messagePanel.conversationPage.postItemById(postData.id);
      await t.expect(targetPost.exists).ok(postData)
    });

    await h(t).withLog(`Then I can check the post's time should have right format`, async () => {
      const utcOffset = await H.getUtcOffset();
      const formatTime = moment(postData.creationTime).utcOffset(-utcOffset).format(format);
      await t.expect(targetPost.time.textContent).eql(formatTime, targetPost.time.textContent);
    }, true);
  },
);

test(formalName('When update user name, can sync dynamically in message metadata.',
  ['JPT-91', 'P2', 'ConversationStream']),
  async (t: TestController) => {
    const postContent = `some random text post ${Date.now()}`;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    const userGlip = await h(t).getGlip(user);
    const changedName = `first name ${uuid()}`;

    let groupId, postData, targetPost;

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then I enter a conversation in team section`, async () => {
      await app.homePage.messagePanel.teamsSection.nthConversationEntry(0).enter();
      groupId = await app.homePage.messagePanel.getCurrentGroupIdFromURL();
    });

    await h(t).withLog(`When I send one post to current conversation`, async () => {
      postData = (await userGlip.sendPost(groupId, postContent)).data;
      targetPost = app.homePage.messagePanel.conversationPage.posts.withAttribute('data-id', postData.id)
      await t.expect(targetPost.exists).ok();
    });

    await h(t).withLog(`And I modify user name through api,`, async () => {
      await userGlip.updatePerson(null, { first_name: changedName });
    });

    await h(t).withLog(`Then I can find user name change to ${changedName}.`, async () => {
      await t.expect(targetPost.child().withText(changedName).exists).ok();
      await userGlip.updatePerson(null, { first_name: 'John' }); // reset first_name
    }, true);
  },
);

test(formalName('When update custom status, can sync dynamically in message metadata.',
  ['JPT-95', 'P2', 'ConversationStream']),
  async (t: TestController) => {
    const postContent = `JPT-95 ${uuid()}`;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    const userGlip = await h(t).getGlip(user);

    let groupId, postData, targetPost;

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then I enter a conversation in team section`, async () => {
      await app.homePage.messagePanel.teamsSection.nthConversationEntry(0).enter();
      groupId = await app.homePage.messagePanel.getCurrentGroupIdFromURL();
    });

    await h(t).withLog(`And I send one text post to current conversation`, async () => {
      postData = (await userGlip.sendPost(groupId, postContent)).data;
      targetPost = app.homePage.messagePanel.conversationPage.postItemById(postData['_id']);
      await t.expect(targetPost.exists).ok(postData);
    });

    const userStatusList = ['In a meeting', 'content of user modify']
    for (const userStatus of userStatusList) {
      await h(t).withLog(`When I modify user status "${userStatus}" through api`, async () => {
        await userGlip.updatePerson(null, { away_status: userStatus });
      });

      await h(t).withLog(`Then I can find user status display change to "${userStatus}"`, async () => {
        await t.expect(targetPost.userStatus.withText(userStatus).exists).ok();
      }, true);
    }

    await h(t).withLog(`When I delete user status through api request`, async () => {
      await userGlip.updatePerson(null, { away_status: null });
    });

    await h(t).withLog(`Then I only can find username display without status`, async () => {
      // FIXME: waiting for FIJI-1433 add status data-name
      await t.expect(targetPost.userStatus.withAttribute('data-name', 'time').exists).ok();
    });
  },
);
