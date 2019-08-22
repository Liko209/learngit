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
import { ITestMeta, IGroup } from '../../v2/models';

fixture('ConversationCard')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Check send time for each message metadata.', ['JPT-43', 'P2', 'ConversationStream']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  const format = 'h:mm A';

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).glip(loginUser).init();

    const oldTeamsId: any[] = await h(t).glip(loginUser).getTeams().then(res => res.data.teams
      .filter(team => !team.is_archived && !team.deactivated && !!team.members)
      .map(team => team._id));

    if (oldTeamsId.length == 0) {
      await h(t).scenarioHelper.createTeam(<IGroup>{
        type: 'Team',
        members: [loginUser],
        owner: loginUser,
        name: uuid()
      });
    }
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let teamId;
  await h(t).withLog(`Then I enter a random conversation in teams section`, async () => {
    const conversations = app.homePage.messageTab.teamsSection.conversations
    const count = await conversations.count;
    const n = Math.floor(Math.random() * count);
    await app.homePage.messageTab.teamsSection.nthConversationEntry(n).enter();
    teamId = await app.homePage.messageTab.getCurrentGroupIdFromURL();
  });

  let postData, targetPost;
  await h(t).withLog(`When I send one post to current conversation`, async () => {
    postData = await h(t).platform(loginUser).sendTextPost(uuid(), teamId).then(res => res.data);
    targetPost = app.homePage.messageTab.conversationPage.postItemById(postData.id);
    await targetPost.ensureLoaded();
  });

  await h(t).withLog(`Then I can check the post's time should have right format`, async () => {
    const utcOffset = await H.getUtcOffset();
    const formatTime = moment(postData.creationTime).utcOffset(-utcOffset).format(format);
    await t.expect(targetPost.time.textContent).eql(formatTime, targetPost.time.textContent);
  }, true);
});

test(formalName('When update user name, can sync dynamically in message metadata.',
  ['JPT-91', 'P2', 'ConversationStream']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).glip(loginUser).init();

    const changedName = `first name ${uuid()}`;

    await h(t).withLog('Given I have an extension with 1 team', async () => {
      const oldTeamsId: any[] = await h(t).glip(loginUser).getTeams().then(res => res.data.teams
        .filter(team => !team.is_archived && !team.deactivated && !!team.members)
        .map(team => team._id));

      if (oldTeamsId.length == 0) {
        await h(t).scenarioHelper.createTeam(<IGroup>{
          type: 'Team',
          members: [loginUser],
          owner: loginUser,
          name: uuid()
        });
      }
    });

    let groupId, postData, targetPost;
    await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      });
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    })

    await h(t).withLog(`Then I enter a conversation in team section`, async () => {
      await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
      groupId = await app.homePage.messageTab.getCurrentGroupIdFromURL();
    });

    await h(t).withLog(`When I send one post to current conversation`, async () => {
      postData = await h(t).platform(loginUser).sendTextPost(uuid(), groupId).then(res => res.data);
      targetPost = app.homePage.messageTab.conversationPage.posts.withAttribute('data-id', postData.id)
      await t.expect(targetPost.exists).ok();
    });

    await h(t).withLog(`And I modify user name through api,`, async () => {
      await h(t).glip(loginUser).updatePerson({ first_name: changedName });
    });

    await h(t).withLog(`Then I can find user name change to {changedName}.`, async (step) => {
      step.setMetadata('changedName', changedName)
      await t.expect(targetPost.child().withText(changedName).exists).ok();
      await h(t).glip(loginUser).updatePerson({ first_name: 'John' }); // reset first_name
    }, true);
  },
);

test(formalName('When update custom status, can sync dynamically in message metadata.',
  ['JPT-95', 'P2', 'ConversationStream']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).glip(loginUser).init();

    await h(t).withLog('Given I have an extension with 1 team', async () => {
      await h(t).glip(loginUser).init();

      const oldTeamsId: any[] = await h(t).glip(loginUser).getTeams().then(res => res.data.teams
        .filter(team => !team.is_archived && !team.deactivated && !!team.members)
        .map(team => team._id));

      if (oldTeamsId.length == 0) {
        await h(t).scenarioHelper.createTeam(<IGroup>{
          type: 'Team',
          members: [loginUser],
          owner: loginUser,
          name: uuid()
        });
      }
    });

    let groupId, postDataId, targetPost;
    await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      });
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    })

    await h(t).withLog(`Then I enter a conversation in team section`, async () => {
      await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
      groupId = await app.homePage.messageTab.getCurrentGroupIdFromURL();
    });

    await h(t).withLog(`And I send one text post to current conversation`, async () => {
      postDataId = await h(t).glip(loginUser).sendPost(groupId, uuid()).then(res => {
        return res.data._id;
      });
      targetPost = app.homePage.messageTab.conversationPage.postItemById(postDataId);
      await t.expect(targetPost.exists).ok();
    });

    const userStatusList = ['In a meeting', 'content of user modify']
    for (const userStatus of userStatusList) {
      await h(t).withLog(`When I modify user status "{userStatus}" through api`, async (step) => {
        step.setMetadata('userStatus', userStatus);
        await h(t).glip(loginUser).updatePerson({ away_status: userStatus });
      });

      await h(t).withLog(`Then I can find user status display change to "{userStatus}"`, async (step) => {
        step.setMetadata('userStatus', userStatus);
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


test.meta(<ITestMeta>{
  priority: ['p2'],
  caseIds: ['JPT-90'],
  keywords: ['Message Metadata', 'Content Panel']
})('Default item for each message metadata', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[4];
  const anotherUser = users[6];

  const app = new AppRoot(t);
  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog(`Given I have extension with a chat`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter a conversation in directMessage section`, async () => {
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const lastPostItem = conversationPage.lastPostItem
  await h(t).withLog(`When I send one post to current conversation`, async () => {
    await conversationPage.sendMessage(uuid());
    await conversationPage.lastPostItem.waitForPostToSend();
  });

  await h(t).withLog(`Then there is a avatar in the last post.`, async () => {
    await t.expect(lastPostItem.avatar.exists).ok();
  });

  await h(t).withLog(`And there is user name in the last post.`, async () => {
    await t.expect(lastPostItem.name.exists).ok();
  });

  await h(t).withLog(`And there is send time in the last post.`, async () => {
    await t.expect(lastPostItem.time.exists).ok();
  });
});