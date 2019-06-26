/*
 * @Author: Foden Lin (foden.lin@ringcentral.com)
 * @Date: 2019-06-25
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

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
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open a team and upload a image file that thumbnail support preview (png)', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend(20e3);
  });


  //Entry 1: Conversation
  const postId = await conversationPage.nthPostItem(-1).postId;
  const posts = app.homePage.messageTab.conversationPage.posts;

  await h(t).withLog('When I click the image', async () => {
      await t.click(posts.nth(-1).find('img'));
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

  await h(t).withLog(`And I click the image item ${filesName[0]} thumbnail`, async () => {
    await t.click(imageTab.nthItem(0).thumbnail)
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
