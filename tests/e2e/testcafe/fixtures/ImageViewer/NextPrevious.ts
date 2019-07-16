/*
 * @Author: Foden Lin (foden.lin@ringcentral.com)
 * @Date: 2019-06-25
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import * as assert from 'assert';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('ImageViewer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1230'],
  keywords: ['image viewer', 'Next/Previous'],
  maintainers: ['potar.he']
})('The original image should be displayed in the previewer & The image should be proportionally scaled in the previewer when clicking one bigger image ', async t => {

  const imagePaths = ['./sources/1.png', './sources/2.png', './sources/3.png'];

  const loginUser = h(t).rcData.mainCompany.users[4];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: {teamName}`, async (step) => {
    step.setMetadata('teamName', team.name)
    await h(t).scenarioHelper.createTeam(team);
  });

  let imagePostId;
  await h(t).withLog(`And I send a post with 3 images`, async () => {
    imagePostId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths: imagePaths,
      group: team,
      operator: loginUser
    });
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter this team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const viewerDialog = app.homePage.fileAndImagePreviewer;
  await h(t).withLog(`When I click the first image `, async () => {
    await t.click(conversationPage.postItemById(imagePostId).img.nth(0));
  });

  await h(t).withLog(`Then the image viewer should be popup`, async () => {
    await viewerDialog.ensureLoaded();
    await await t.expect(viewerDialog.positionIndex.textContent).match(/(1\/3)/);
  });

  await h(t).withLog(`When I hover the image `, async () => {
    await viewerDialog.hoverPreviewer();
  });

  await h(t).withLog(`And should be able to see the next icon.`, async () => {
    await t.expect(viewerDialog.forwardButton.exists).ok()
      .expect(viewerDialog.forwardButton.visible).ok();
  });

  await h(t).withLog(`When I click next icon`, async () => {
    await viewerDialog.hoverPreviewer();
    await viewerDialog.clickForwardButton();
  });

  await h(t).withLog(`Then next image should be showed`, async () => {
    await await t.expect(viewerDialog.positionIndex.textContent).match(/(2\/3)/);
  });

  await h(t).withLog(`When I press right key`, async () => {
    await t.pressKey('right');
  });

  await h(t).withLog(`Then next image should be showed`, async () => {
    await await t.expect(viewerDialog.positionIndex.textContent).match(/(3\/3)/);
  });

  await h(t).withLog(`When I click back icon`, async () => {
    await viewerDialog.hoverPreviewer();
    await viewerDialog.clickPreviousButton();
  });

  await h(t).withLog(`Then previous image should be showed`, async () => {
    await await t.expect(viewerDialog.positionIndex.textContent).match(/(2\/3)/);
  });

  await h(t).withLog(`When I press left key`, async () => {
    await t.pressKey('left');
  });

  await h(t).withLog(`Then previous image should be showed`, async () => {
    await await t.expect(viewerDialog.positionIndex.textContent).match(/(1\/3)/);
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1276'],
  keywords: ['image viewer', 'Next/Previous'],
  maintainers: ['potar.he']
})('Next icon should displayed by adding new images when user is viewing the last image', async t => {

  const imagePaths = ['./sources/1.png', './sources/2.png'];
  const newImagePath = './sources/3.png';

  const loginUser = h(t).rcData.mainCompany.users[4];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: {teamName}`, async (step) => {
    step.setMetadata('teamName', team.name)
    await h(t).scenarioHelper.createTeam(team);
  });

  let imagePostId;
  await h(t).withLog(`And I send a post with 2 images`, async () => {
    imagePostId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths: imagePaths,
      group: team,
      operator: loginUser
    });
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter this team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const viewerDialog = app.homePage.fileAndImagePreviewer;
  await h(t).withLog(`When I click the last image `, async () => {
    await t.click(conversationPage.postItemById(imagePostId).img.nth(-1));
  });

  await h(t).withLog(`Then the image viewer should be popup`, async () => {
    await viewerDialog.ensureLoaded();
    await await t.expect(viewerDialog.positionIndex.textContent).match(/(2\/2)/);
  });

  await h(t).withLog(`When I hover the image `, async () => {
    await viewerDialog.hoverPreviewer();
  });

  await h(t).withLog(`And There's no next icon displayed..`, async () => {
    await t.expect(viewerDialog.forwardButton.exists).notOk()
  });

  await h(t).withLog(`When I Add an new image into this conversation via api`, async () => {
    await h(t).scenarioHelper.uploadFile({
      filePath: newImagePath,
      group: team,
      operator: loginUser
    });
  });

  await h(t).withLog(`When I hover the image `, async () => {
    await viewerDialog.hoverPreviewer();
  });

  await h(t).withLog(`Then The next icon is displayed`, async () => {
    await t.expect(viewerDialog.forwardButton.exists).ok()
      .expect(viewerDialog.forwardButton.visible).ok();
  });

  await h(t).withLog(`When I click next icon`, async () => {
    await viewerDialog.hoverPreviewer();
    await viewerDialog.clickForwardButton();
  });

  await h(t).withLog(`Then next image should be showed`, async () => {
    await await t.expect(viewerDialog.positionIndex.textContent).match(/(3\/3)/);
  });

})