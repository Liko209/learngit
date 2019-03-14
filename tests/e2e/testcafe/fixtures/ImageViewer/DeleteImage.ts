/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-14 09:30:05
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('ImageViewer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Image viewer behavior when the image being viewed is deleted', ['Chris.Zhan', 'P2', 'JPT-1343']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.png','../../sources/2.png'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open a team and upload a image file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const postId = await conversationPage.nthPostItem(-1).postId;
  const posts = app.homePage.messageTab.conversationPage.posts;
  await h(t).withLog('Then I can find the image in post', async () => {
    await t.expect(posts.nth(-1).find('img').exists).ok();
  });

  await h(t).withLog('When I click the image', async () => {
    await t.click(posts.nth(-1).find('img'));
  });

  const viewerDialog = app.homePage.viewerDialog;
  await h(t).withLog('Then the image viewer dialog show up', async () => {
    viewerDialog.shouldBePopup();
  });

  await h(t).withLog('When I delete the post and image', async () => {
    const fileIds = await h(t).glip(loginUser).getFilesIdsFromPostId(postId);
    await h(t).glip(loginUser).deleteFile(fileIds[0]);
  });

  await h(t).withLog('Then the dialog should be close', async () => {
    await viewerDialog.shouldBeClosed();
  });

  const alertText = 'Sorry, the image you were viewing is deleted.'
  await h(t).withLog(`And there should be success flash toast (short = 2s) displayed "${alertText}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });
});

test(formalName('Image viewer behavior when the team was deleted', ['Chris.Zhan', 'P2', 'JPT-1344']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.png','../../sources/2.png'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open a team and upload a image file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const postId = await conversationPage.nthPostItem(-1).postId;
  const posts = app.homePage.messageTab.conversationPage.posts;
  await h(t).withLog('Then I can find the image in post', async () => {
    await t.expect(posts.nth(-1).find('img').exists).ok();
  });

  await h(t).withLog('When I click the image', async () => {
    await t.click(posts.nth(-1).find('img'));
  });

  const viewerDialog = app.homePage.viewerDialog;
  await h(t).withLog('Then the image viewer dialog show up', async () => {
    viewerDialog.shouldBePopup();
  });

  await h(t).withLog('When I delete team', async () => {
    await h(t).platform(loginUser).deleteTeam(teamId);
  });

  await h(t).withLog('Then the dialog should be close', async () => {
    await viewerDialog.shouldBeClosed();
  });

  const alertText = 'The team was deleted. To know more, contact the team administrator.'
  await h(t).withLog(`And there should be success flash toast (short = 2s) displayed "${alertText}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('And user should be navigated to an empty page', async () => {
    await t.expect(h(t).href).match(/messages$/);
  });
});

test(formalName('Image viewer behavior when the team was archived', ['Chris.Zhan', 'P2', 'JPT-1344']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.png','../../sources/2.png'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open a team and upload a image file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const postId = await conversationPage.nthPostItem(-1).postId;
  const posts = app.homePage.messageTab.conversationPage.posts;
  await h(t).withLog('Then I can find the image in post', async () => {
    await t.expect(posts.nth(-1).find('img').exists).ok();
  });

  await h(t).withLog('When I click the image', async () => {
    await t.click(posts.nth(-1).find('img'));
  });

  const viewerDialog = app.homePage.viewerDialog;
  await h(t).withLog('Then the image viewer dialog show up', async () => {
    viewerDialog.shouldBePopup();
  });

  await h(t).withLog('When I delete team', async () => {
    await h(t).platform(loginUser).archiveTeam(teamId);
  });

  await h(t).withLog('Then the dialog should be close', async () => {
    await viewerDialog.shouldBeClosed();
  });

  const alertText = 'The team was archived. To know more, contact the team administrator.'
  await h(t).withLog(`And there should be success flash toast (short = 2s) displayed "${alertText}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('And user should be navigated to an empty page', async () => {
    await t.expect(h(t).href).match(/messages$/);
  });
});
