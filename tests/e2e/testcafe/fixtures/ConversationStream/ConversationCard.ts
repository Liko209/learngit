/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-12 16:29:39
* Copyright © RingCentral. All rights reserved.
*/
import * as moment from 'moment';
import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';
import { ClientFunction } from 'testcafe';

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
    const user = users[4];
    const userPlatform = await h(t).getPlatform(user);
    const format = 'hh:mm A';
    let groupId, postData, targetPost;

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
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
      await shouldMatchUrl;
      groupId = await getCurrentGroupIdFromURL();
    });

    await h(t).withLog(`When I send one post to current conversation`, async () => {
      postData = (await userPlatform.createPost({text: postContent}, groupId)).data;
      targetPost = app.homePage.messagePanel.conversationSection.posts.withAttribute('data-id', postData.id)
      await t.expect(targetPost.exists).ok(postData)
    });

    //TODO: 
    await h(t).withLog(`Then I can check the post's time should have right format`, async () => {
      const formatTime = moment(postData.creationTime).format(format);
      const timeDiv = targetPost.find('div').withText(formatTime);
      // const timeDiv2 = targetPost.find('div').filter( (node)=>{ 
      //   return moment(node.textContent, format, true).isValid()
      // },  {moment,format})
      await t.expect(timeDiv.exists).ok();
    });
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
    const user = users[4];
    const userGlip = await h(t).getGlip(user);
    const changedName = `Random ${Date.now().toString(5)}`;

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
      `Then I enter a random conversation in team section`,
      async () => {
        const conversations = app.homePage.messagePanel.teamsSection.conversations;
        const count = await conversations.count;
        const n = Math.floor(Math.random() * count);
        await app.homePage.messagePanel.teamsSection.nthConversationEntry(n).enter();
        await shouldMatchUrl;
        groupId = await getCurrentGroupIdFromURL();
      },
    );

    await h(t).withLog(`When I send one post to current conversation`, async () => {
      postData = (await userGlip.sendPost(groupId, postContent)).data;
      targetPost = app.homePage.messagePanel.conversationSection.posts.withAttribute('data-id', postData.id)
      await t.expect(targetPost.exists).ok(postData);
      userName = await targetPost.child(1).child(0).child(0).child(0).textContent;
      console.log(userName);
    })

    await h(t).withLog(`And I modify user name through api,`, async () => {
      await userGlip.updatePerson(null, { first_name: changedName });
    })

    await h(t).withLog(`Then I can find user name change to ${changedName}.`, async () => {
      const tempName = targetPost.child(1).child(0).child(0).child(0).textContent
      await t.expect(tempName).contains(changedName);
      await userGlip.updatePerson(null, { first_name: userName.split(" ")[0] })
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
    const user = users[4];
    const userGlip = await h(t).getGlip(user);

    let groupId, postData, targetPost, userName;

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog(
      `Then I enter a random conversation in team section`,
      async () => {
        const conversations = app.homePage.messagePanel.teamsSection.conversations;
        const count = await conversations.count;
        const n = Math.floor(Math.random() * count);
        await app.homePage.messagePanel.teamsSection.nthConversationEntry(n).enter();
        await shouldMatchUrl;
        groupId = await getCurrentGroupIdFromURL();
      },
    );

    await h(t).withLog(`And I send one text post to current conversation`, async () => {
      postData = (await userGlip.sendPost(groupId, postContent)).data;
      targetPost = app.homePage.messagePanel.conversationSection.posts.withAttribute('data-id', postData.id)
      await t.expect(targetPost.exists).ok(postData);
      userName = await targetPost.child(1).child(0).child(0).child(0).textContent;
    });

    await h(t).withLog(`When I modify user status "In a meeting" through api`, async () => {
      await userGlip.updatePerson(null, { away_status: `${userName} In a meeting` });
    });

    await h(t).withLog(`Then I can find username display change to "${userName} In a meeting"`, async () => {
      await userGlip.updatePerson(null, { away_status: `${userName} In a meeting` });
      await t.expect(targetPost.textContent).contains('In a meeting');
    });

    await h(t).withLog(`When I modify user status "content of user modify" through api`, async () => {
      await userGlip.updatePerson(null, { away_status: `${userName} content of user modify` });
    });

    await h(t).withLog(`Then I can find username display change to "${userName} content of user modify"`, async () => {
      await t.expect(targetPost.textContent).contains('content of user modify');
    });

    await h(t).withLog(`When I delete user status through api request`, async () => {
      await userGlip.updatePerson(null, { away_status: null });
    });

    await h(t).withLog(`Then I only can find username display is "${userName}" without status`, async () => {
      await t.expect(targetPost.textContent).notContains('content of user modify');
      await t.expect(targetPost.textContent).contains(userName);
    });
  },
);
