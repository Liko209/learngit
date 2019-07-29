/*
 * @Author: Foden Lin (foden.lin@ringcentral.com)
 * @Date: 2019-06-25
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import * as assert from 'assert';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';
import { ClientFunction } from 'testcafe';

fixture('ImageViewer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Scale image', ['Foden.lin', 'P2', 'JPT-1248', 'JPT-1249', 'JPT-1409']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.png', '../../sources/2.png'];
  const filesName = ['1.png', '2.png'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];


  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded()
  });

  await h(t).withLog('When I open a team and upload a image file that thumbnail support preview (png)', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend(20e3);
    await conversationPage.nthPostItem(-1).waitImageVisible();
  });

  //Entry 1: Conversation
  await h(t).withLog('When I click the image', async () => {
    await t.click(conversationPage.nthPostItem(-1).images)
  });

  const viewerDialog = app.homePage.fileAndImagePreviewer;

  await h(t).withLog('And I hover the image', async () => {
    await viewerDialog.hoverPreviewer();
  });

  await h(t).withLog(`Then should display zoom percentage as 100%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('100%');
  });

  await h(t).withLog(`Then should display the disabled button of reset zoom`, async () => {
    await viewerDialog.zoomResetButtonIsDisabled();
  });

  await h(t).withLog('When I click the scale up button', async () => {
    await viewerDialog.clickZoomInButton();
  });

  await h(t).withLog(`Then should display zoom percentage as 110%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('110%');
  });

  await h(t).withLog('When I click the reset zoom button', async () => {
    await viewerDialog.clickZoomResetButton();
  });

  await h(t).withLog(`Then should display zoom percentage as 100%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('100%');
  });

  await h(t).withLog('When I click the zoom out button', async () => {
    await viewerDialog.clickZoomOutButton();
  });

  await h(t).withLog(`Then should display zoom percentage as 90%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('90%');
  });

  await h(t).withLog('When I click the reset zoom button', async () => {
    await viewerDialog.clickZoomResetButton();
  });

  await h(t).withLog(`Then should display zoom percentage as 100%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('100%');
  });

  await h(t).withLog('When I close the image viewer dialog', async () => {
    await viewerDialog.clickCloseButton();
  });

  //Entry 2: On the right shelf
  const imageTabEntry = app.homePage.messageTab.rightRail.imagesEntry;
  const imageTab = app.homePage.messageTab.rightRail.imagesTab;
  await h(t).withLog(`When enter image tab`, async () => {
    await imageTabEntry.enter();
  });

  await h(t).withLog(`And I click the image item ${filesName[0]}`, async () => {
    await t.click(imageTab.nthItem(0).self)
  });

  await h(t).withLog('And I hover the image', async () => {
    await viewerDialog.hoverPreviewer();
  });

  await h(t).withLog(`Then should display zoom percentage as 100%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('100%');
  });

  await h(t).withLog(`Then should display the disabled button of reset zoom`, async () => {
    await viewerDialog.zoomResetButtonIsDisabled();
  });

  await h(t).withLog('When I click the scale up button', async () => {
    await viewerDialog.clickZoomInButton();
  });

  await h(t).withLog(`Then should display zoom percentage as 110%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('110%');
  });

  await h(t).withLog('When I click the reset zoom button', async () => {
    await viewerDialog.clickZoomResetButton();
  });

  await h(t).withLog(`Then should display zoom percentage as 100%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('100%');
  });

  await h(t).withLog('When I click the zoom out button', async () => {
    await viewerDialog.clickZoomOutButton();
  });

  await h(t).withLog(`Then should display zoom percentage as 90%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('90%');
  });

  await h(t).withLog('When I click the reset zoom button', async () => {
    await viewerDialog.clickZoomResetButton();
  });

  await h(t).withLog(`Then should display zoom percentage as 100%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('100%');
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1261'],
  keywords: ['image viewer'],
  maintainers: ['potar.he']
})('The image will be reset in full-screen previewer when the window changes.', async t => {
  if (await H.isElectron() || await H.isEdge()) {
    await h(t).log('This case (resize) is not working on Electron or Edge!');
    return;
  }

  const filesPathViaApi = './sources/1.png';
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

  await h(t).withLog(`And I upload a image file to this team`, async () => {
    await h(t).scenarioHelper.uploadFile({
      filePath: filesPathViaApi,
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
  await h(t).withLog(`When I click the image of the last post`, async () => {
    await t.click(conversationPage.lastPostItem.images);
  });

  await h(t).withLog(`Then the image viewer should be popup`, async () => {
    await viewerDialog.ensureLoaded();
  });

  await h(t).withLog(`And should display zoom percentage as 100%`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('100%');
  });

  await h(t).withLog(`When I reduce the window of the browser 1/2`, async () => {
    const windowHeight = await ClientFunction(() => window.innerHeight || document.body.clientHeight)();
    const screenWidth = await ClientFunction(() => window.screen.availWidth)();
    await t.resizeWindow(Math.round(screenWidth / 2), Math.round(windowHeight / 2));
  });

  await h(t).withLog(`Then The image will be reset with 100% zoom percentage displayed on the previewer.`, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('100%');
  });

  await h(t).withLog(`When I close the viewer and open again`, async () => {
    await viewerDialog.clickCloseButton();
    await t.click(conversationPage.lastPostItem.images);
  });

  await h(t).withLog(`Then the image viewer should be popup`, async () => {
    await viewerDialog.ensureLoaded();
  });

  await h(t).withLog(`Then The image will be reset to default percentage (100%) `, async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('100%');
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1358', 'JPT-1359'],
  keywords: ['image viewer'],
  maintainers: ['potar.he']
})('The original image should be displayed in the previewer & The image should be proportionally scaled in the previewer when clicking one bigger image ', async t => {

  const smallImage = './sources/1.png';
  const largeImage = './sources/large.jpg';
  const smallSizeWidth = 126
  const smallSizeHeight = 116;

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

  let smallImagePostId, largeImagePostId;
  await h(t).withLog(`And I send a post with small image size: `, async () => {
    smallImagePostId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths: smallImage,
      group: team,
      operator: loginUser
    });

    largeImagePostId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths: largeImage,
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
  await h(t).withLog(`When I click the small image`, async () => {
    await t.click(conversationPage.postItemById(smallImagePostId).images);
  });

  await h(t).withLog(`Then the image viewer should be popup`, async () => {
    await viewerDialog.ensureLoaded();
  });
  const size = `${smallSizeWidth} X ${smallSizeHeight}`;
  await h(t).withLog(`And Display the original image {size}`, async (step) => {
    step.setMetadata('size', size);
    await H.retryUntilPass(async () => {
      const width = await viewerDialog.imageCanvas.clientWidth;
      const height = await viewerDialog.imageCanvas.clientHeight;
      assert.ok(width == smallSizeWidth, "width is not match");
      assert.ok(height == smallSizeHeight, "width is not match");
    });
  });

  await h(t).withLog(`When I close the viewer and open large image`, async () => {
    await viewerDialog.clickCloseButton();
    await t.click(conversationPage.postItemById(largeImagePostId).images);
  });

  await h(t).withLog(`Then the image viewer should be popup`, async () => {
    await viewerDialog.ensureLoaded();
  });

  await h(t).withLog(`Then The image should be proportionally scaled until it longer side fits in the previewer `, async () => {
    await viewerDialog.expectImageAllIsVisible();
  });

})
