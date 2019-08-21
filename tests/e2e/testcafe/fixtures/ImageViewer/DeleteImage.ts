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
import { IGroup } from '../../v2/models';

fixture('ImageViewer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Close the viewer and toast popup when the image being viewed is deleted', ['Chris.Zhan', 'P2', 'JPT-1343']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.png', '../../sources/2.png'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open a team and upload a image file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const postId = await conversationPage.nthPostItem(-1).postId;
  const posts = app.homePage.messageTab.conversationPage.posts;
  await h(t).withLog('Then I can find the image in post', async () => {
    await t.expect(posts.nth(-1).find('[data-test-automation-class="image"]').exists).ok();
  });

  await h(t).withLog('When I click the image', async () => {
    await t.click(posts.nth(-1).find('[data-test-automation-class="image"]'));
  });

  const viewerDialog = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image viewer dialog show up', async () => {
    await viewerDialog.ensureLoaded();
  });

  await h(t).withLog('When I delete the post and image', async () => {
    const fileIds = await h(t).glip(loginUser).getFilesIdsFromPostId(postId);
    await h(t).glip(loginUser).deleteFile(fileIds[0]);
  });

  await h(t).withLog('Then the dialog should be close', async () => {
    await viewerDialog.ensureDismiss();
  });

  const alertText = 'Sorry, the image you were viewing is deleted.'
  await h(t).withLog(`And there should be success flash toast (short = 2s) displayed "{alertText}"`, async (step) => {
    step.setMetadata('alertText', alertText);
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });
});

test(formalName('Go to blank page and show a toast when the team was deleted', ['Chris.Zhan', 'P2', 'JPT-1344']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.png', '../../sources/2.png'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open a team and upload a image file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const posts = app.homePage.messageTab.conversationPage.posts;
  await h(t).withLog('Then I can find the image in post', async () => {
    await t.expect(posts.nth(-1).find('[data-test-automation-class="image"]').exists).ok();
  });

  await h(t).withLog('When I click the image', async () => {
    await t.click(posts.nth(-1).find('[data-test-automation-class="image"]'));
  });

  const viewerDialog = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image viewer dialog show up', async () => {
    await viewerDialog.ensureLoaded();
  });

  await h(t).withLog('When I delete team', async () => {
    await h(t).platform(loginUser).deleteTeam(team.glipId);
  });

  await h(t).withLog('Then the dialog should be close', async () => {
    await viewerDialog.ensureDismiss();
  });

  const alertText = 'The team was deleted. To know more, contact the team administrator.'
  await h(t).withLog(`And there should be success flash toast (short = 2s) displayed "{alertText}"`, async (step) => {
    step.setMetadata('alertText', alertText);
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('And user should be navigated to an empty page', async () => {
    await t.expect(h(t).href).match(/messages$/);
  });
});

test(formalName('Go to blank page and show a toast when the team was archived', ['Chris.Zhan', 'P2', 'JPT-1344']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.png', '../../sources/2.png'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open a team and upload a image file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const posts = app.homePage.messageTab.conversationPage.posts;
  await h(t).withLog('Then I can find the image in post', async () => {
    await t.expect(posts.nth(-1).find('[data-test-automation-class="image"]').exists).ok();
  });

  await h(t).withLog('When I click the image', async () => {
    await t.click(posts.nth(-1).find('[data-test-automation-class="image"]'));
  });

  const viewerDialog = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image viewer dialog show up', async () => {
    await viewerDialog.ensureLoaded();
  });

  await h(t).withLog('When I archive team', async () => {
    await h(t).platform(loginUser).archiveTeam(team.glipId);
  });

  await h(t).withLog('Then the dialog should be close', async () => {
    await viewerDialog.ensureDismiss();
  });

  const alertText = 'This team was archived. To know more, contact the team administrator.'
  await h(t).withLog(`And there should be success flash toast (short = 2s) displayed "{alertText}"`, async (step) => {
    step.setMetadata('alertText', alertText);
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('And user should be navigated to an empty page', async () => {
    await t.expect(h(t).href).match(/messages$/);
  });
});

test(formalName('Go to blank page and show a toast when the team was closed', ['Chris.Zhan', 'P2', 'JPT-1344']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.png', '../../sources/2.png'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open a team and upload a image file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const posts = app.homePage.messageTab.conversationPage.posts;
  await h(t).withLog('Then I can find the image in post', async () => {
    await t.expect(posts.nth(-1).find('[data-test-automation-class="image"]').exists).ok();
  });

  await h(t).withLog('When I click the image', async () => {
    await t.click(posts.nth(-1).find('[data-test-automation-class="image"]'));
  });

  const viewerDialog = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image viewer dialog show up', async () => {
    await viewerDialog.ensureLoaded();
  });

  await h(t).withLog('When I close the team', async () => {
    await h(t).glip(loginUser).updateProfile({
      [`hide_group_${team.glipId}`]: true,
    });
  });

  await h(t).withLog('Then the dialog should be close', async () => {
    await viewerDialog.ensureDismiss();
  });

  const alertText = 'You removed the conversation.'
  await h(t).withLog(`And there should be success flash toast (short = 2s) displayed "{alertText}"`, async (step) => {
    step.setMetadata('alertText', alertText);
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('And user should be navigated to an empty page', async () => {
    await t.expect(h(t).href).match(/messages$/);
  });
});
