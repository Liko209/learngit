/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-13 13:26:25
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('AtMention/AtMention')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Data in mention page should be dynamically sync', ['P2', 'JPT-311']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    await h(t).resetGlipAccount(user);
    const userPlatform = await h(t).getPlatform(user);
    const user5Platform = await h(t).getPlatform(users[5]);
    const mentionsEntry = app.homePage.messagePanel.mentionsEntry;
    const postListPage = app.homePage.messagePanel.postListPage;
    let group;
    await h(t).withLog('Given I have an extension with 2 at-mention posts', async () => {
      group = await userPlatform.createGroup({
        type: 'Group', members: [user.rcId, users[5].rcId, users[6].rcId],
      });
      await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        group.data.id,
      );
      await user5Platform.createPost(
        { text: `Hi again, ![:Person](${user.rcId})` },
        group.data.id,
      );
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I can find 2 posts in the mentions page', async () => {
      await mentionsEntry.enter();
      await t.expect(postListPage.find('[data-name="conversation-card"]').count).eql(2);
    }, true);

    let newPost;
    await h(t).withLog('Then I send a new post to user with mention', async () => {
      newPost = await user5Platform.createPost(
        { text: `Test add a mention, ![:Person](${user.rcId})` },
        group.data.id,
      );
    });

    await h(t).withLog('Then I can find 3 posts in the mentions page', async () => {
      await mentionsEntry.enter();
      await t.expect(postListPage.find('[data-name="conversation-card"]').count).eql(3);
    }, true);

    await h(t).withLog('Then I delete the new post', async () => {
      const user5Glip = await h(t).getGlip(users[5]);
      await user5Glip.deletePost(newPost.data.id, group.data.id);
    });

    await h(t).withLog('Then I can find 2 posts in the mentions page', async () => {
      await mentionsEntry.enter();
      await t.expect(postListPage.find('[data-name="conversation-card"]').count).eql(2);
    }, true);
  },
);

test(formalName('Jump to conversation bottom when click name', ['P1', 'JPT-314']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    await h(t).resetGlipAccount(user);
    const userPlatform = await h(t).getPlatform(user);
    const user5Platform = await h(t).getPlatform(users[5]);
    const mentionsEntry = app.homePage.messagePanel.mentionsEntry;
    const postListPage = app.homePage.messagePanel.mentionPage;
    const conversationPage = app.homePage.messagePanel.conversationPage;

    let chat, group, team;
    let chatPost, groupPost, teamPost;
    await h(t).withLog('Given I have an extension with 3 different types of conversations and each has a post with mention', async () => {
      chat = await userPlatform.createGroup({
        type: 'PrivateChat', members: [user.rcId, users[5].rcId],
      });
      group = await userPlatform.createGroup({
        type: 'Group', members: [user.rcId, users[5].rcId, users[6].rcId],
      });
      team = await userPlatform.createGroup({
        type: 'Team',
        name: `Team ${uuid()}`,
        members: [user.rcId, users[5].rcId],
      });
      chatPost = await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        chat.data.id,
      );
      groupPost = await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        group.data.id,
      );
      teamPost = await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        team.data.id,
      );
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I can find 3 posts in the mentions page', async () => {
      await mentionsEntry.enter();
      await t.expect(postListPage.posts.count).eql(3);
    }, true);

    await h(t).withLog('Then I click the conversation name in the chat\'s conversation card', async() => {
      await postListPage.postItemById(chatPost.data.id).goToConversation();
    });

    await h(t).withLog('Should jump to the chat page and scroll to bottom', async () => {
      await t.expect(conversationPage.currentGroupId).eql(chat.data.id);
      await conversationPage.expectStreamScrollToBottom();
    });

    await h(t).withLog('Then I click the conversation name in the group\'s conversation card', async() => {
      await mentionsEntry.enter();
      await postListPage.postItemById(groupPost.data.id).goToConversation();
    });

    await h(t).withLog('Should jump to the group page and scroll to bottom', async () => {
      await t.expect(conversationPage.currentGroupId).eql(group.data.id);
      await conversationPage.expectStreamScrollToBottom();
    });

    await h(t).withLog('Then I click the conversation name in the team\'s conversation card', async() => {
      await mentionsEntry.enter();
      await postListPage.postItemById(teamPost.data.id).goToConversation();
    });

    await h(t).withLog('Should jump to the team page and scroll to bottom', async () => {
      await t.expect(conversationPage.currentGroupId).eql(team.data.id);
      await conversationPage.expectStreamScrollToBottom();
    });
  },
);