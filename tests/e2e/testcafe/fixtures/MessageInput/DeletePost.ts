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
  await h(t).withLog('When I open a team', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
  });

  await h(t).withLog('And I clear all text', async () => {
    await conversationPage.postItemById(textPostId).clickMoreItemOnActionBar();
    await conversationPage.postItemById(textPostId).actionBarMoreMenu.editPost.enter();
    await conversationPage.postItemById(textPostId).deleteMessage();
  });

  await h(t).withLog('Then Prompted with "Delete post" confirmation dialog', async () => {
    await t.wait(1e3);
    await t.expect(app.homePage.messageTab.deleteConfirmDialog.exists).ok();
  });

  await h(t).withLog('When clicks cancel button, ', async () => {
    await t.click(app.homePage.messageTab.deleteCancelButton);
  });

  await h(t).withLog('Then dialog is dismissed and the edit input box is re-focused.', async () => {
    await t.expect(app.homePage.messageTab.deleteConfirmDialog.exists).notOk();
    await t.expect(await conversationPage.postItemById(textPostId).editTextAreaFocused).ok();
  });

  await h(t).withLog('When Hit Enter key again', async () => {
    await conversationPage.postItemById(textPostId).enterEditTextArea();
  });

  await h(t).withLog('Then Prompted with "Delete post" confirmation dialog', async () => {
    await t.wait(1e3);
    await t.expect(app.homePage.messageTab.deleteConfirmDialog.exists).ok();
  });

  await h(t).withLog('When clicks Delete', async () => {
    await t.click(app.homePage.messageTab.deleteOkButton);
  });

  await h(t).withLog('Then The post is deleted', async () => {
    await t.expect(conversationPage.postItemById(textPostId).exists).notOk();
  });
});
