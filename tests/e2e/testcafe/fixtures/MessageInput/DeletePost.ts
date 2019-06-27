/*
 * @Author: Spike.Yang
 * @Date: 2019-06-25 17:40:54
 * Copyright © RingCentral. All rights reserved.
 */


import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('MessageInput/DeletePost')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2359'],
  keywords: ['Delete Post'],
  maintainers: ['Spike.Yang']
})('When editing a message and all text is deleted, delete the post', async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const postText = uuid();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  let textPostId;
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I send a text post: ${postText}`, async () => {
    textPostId = await h(t).scenarioHelper.sentAndGetTextPostId(postText, team, loginUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const post = conversationPage.postItemById(textPostId);
  const messageTab = app.homePage.messageTab;

  await h(t).withLog('When I open a team', async () => {
    await messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
  });

  await h(t).withLog('And I clear all text', async () => {
    await post.clickMoreItemOnActionBar();
    await post.actionBarMoreMenu.editPost.enter();
    await post.deleteMessage();
  });

  await h(t).withLog('Then Prompted with "Delete post" confirmation dialog', async () => {
    await t.wait(2e3);
    await t.expect(messageTab.deleteConfirmDialog.exists).ok();
  });

  await h(t).withLog('When clicks cancel button, ', async () => {
    await t.click(messageTab.deleteCancelButton);
  });

  await h(t).withLog('Then dialog is dismissed and the edit input box is re-focused.', async () => {
    await t.expect(messageTab.deleteConfirmDialog.exists).notOk();
    await t.expect(await post.editTextAreaFocused).ok();
  });

  await h(t).withLog('When Hit Enter key again with space', async () => {
    await post.enterEditTextArea();
  });

  await h(t).withLog('Then Prompted with "Delete post" confirmation dialog', async () => {
    await t.wait(1e3);
    await t.expect(messageTab.deleteConfirmDialog.exists).ok();
  });

  await h(t).withLog('When clicks Delete', async () => {
    await t.click(messageTab.deleteOkButton);
  });

  await h(t).withLog('Then The post is deleted', async () => {
    await t.expect(post.exists).notOk();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2441'],
  keywords: ['Delete Post'],
  maintainers: ['Spike.Yang']
})('Check if the text content is removed and other items remain unchanged when user clear all text content in that post', async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const filePaths = ['./sources/1.png'];

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  let postId;
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I have a mention post (also bookmark it) with two image files in the team`, async () => {
    postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths,
      group: team,
      operator: loginUser,
      text: 'Hi'
    });
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const post = conversationPage.postItemById(postId);
  const messageTab = app.homePage.messageTab;

  await h(t).withLog('When I open a team', async () => {
    await messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
  });

  await h(t).withLog('And clear all text and keep files', async () => {
    await post.clickMoreItemOnActionBar();
    await post.actionBarMoreMenu.editPost.enter();
    await post.deleteMessage();
  });

  await h(t).withLog('Then Don\'t Prompted with "Delete post" confirmation dialog', async () => {
    await t.expect(messageTab.deleteConfirmDialog.exists).notOk();
  });

  await h(t).withLog('And The text content should be removed and other items should remain unchanged.', async () => {
    await t.expect(post.exists).ok();
    await t.expect(post.editTextArea.exists).notOk();
    await t.expect(post.postImg).ok();
  });
});
