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
import { SITE_URL, BrandTire } from '../../config';

fixture('ConversationCard')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Check send time for each message metadata.', ['JPT-43', 'P2', 'ConversationStream']),
  async (t: TestController) => {
    const postContent = `some random text post on ${Date.now()}`;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    const format = 'h:mm A';

    let groupId, postData, targetPost;
    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      await h(t).platform(loginUser).createAndGetGroupId({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog(`Then I enter a random conversation in teams section`, async () => {
      const conversations = app.homePage.messageTab.teamsSection.conversations
      const count = await conversations.count;
      const n = Math.floor(Math.random() * count);
      await app.homePage.messageTab.teamsSection.nthConversationEntry(n).enter();
      groupId = await app.homePage.messageTab.getCurrentGroupIdFromURL();
    });

    await h(t).withLog(`When I send one post to current conversation`, async () => {
      postData = await h(t).platform(loginUser).sendTextPost(postContent, groupId).then(res => res.data);
      targetPost = app.homePage.messageTab.conversationPage.postItemById(postData.id);
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
    const postContent = uuid();
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).glip(loginUser).init();

    const changedName = `first name ${uuid()}`;

    let groupId, postData, targetPost;

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then I enter a conversation in team section`, async () => {
      await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
      groupId = await app.homePage.messageTab.getCurrentGroupIdFromURL();
    });

    await h(t).withLog(`When I send one post to current conversation`, async () => {
      postData = await h(t).platform(loginUser).sendTextPost(postContent, groupId).then(res => res.data);
      targetPost = app.homePage.messageTab.conversationPage.posts.withAttribute('data-id', postData.id)
      await t.expect(targetPost.exists).ok();
    });

    await h(t).withLog(`And I modify user name through api,`, async () => {
      await h(t).glip(loginUser).updatePerson({ first_name: changedName });
    });

    await h(t).withLog(`Then I can find user name change to ${changedName}.`, async () => {
      await t.expect(targetPost.child().withText(changedName).exists).ok();
      await h(t).glip(loginUser).updatePerson({ first_name: 'John' }); // reset first_name
    }, true);
  },
);

test(formalName('When update custom status, can sync dynamically in message metadata.',
  ['JPT-95', 'P2', 'ConversationStream']),
  async (t: TestController) => {
    const postContent = `JPT-95 ${uuid()}`;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).glip(loginUser).init();


    let groupId, postDataId, targetPost;
    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then I enter a conversation in team section`, async () => {
      await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
      groupId = await app.homePage.messageTab.getCurrentGroupIdFromURL();
    });

    await h(t).withLog(`And I send one text post to current conversation`, async () => {
      postDataId = await h(t).glip(loginUser).sendPost(groupId, postContent).then(res => {
        return res.data._id;
      });
      targetPost = app.homePage.messageTab.conversationPage.postItemById(postDataId);
      await t.expect(targetPost.exists).ok();
    });

    const userStatusList = ['In a meeting', 'content of user modify']
    for (const userStatus of userStatusList) {
      await h(t).withLog(`When I modify user status "${userStatus}" through api`, async () => {
        await h(t).glip(loginUser).updatePerson({ away_status: userStatus });
      });

      await h(t).withLog(`Then I can find user status display change to "${userStatus}"`, async () => {
        await t.expect(targetPost.userStatus.withText(userStatus).exists).ok();
      }, true);
    }

    await h(t).withLog(`When I delete user status through api request`, async () => {
      await h(t).glip(loginUser).updatePerson({ away_status: null });
    });

    await h(t).withLog(`Then I only can find username display without status`, async () => {
      await t.expect(targetPost.userStatus.exists).notOk();
    });
  },
);
