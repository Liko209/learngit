/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-14 09:30:05
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';
import * as assert from 'assert';

fixture('ImageViewer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Open the image thumbnail that support preview', ['Potar.He', 'P2', 'JPT-1465', 'JPT-1466', 'JPT-1467']), async t => {

  const filePaths = '../../preview_files/2Pages.doc';
  const filesName = '2Pages.doc';
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];

  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  let postId: string;
  await h(t).withLog(`Given I have a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I have a mention post (also bookmark it) with two image files in the team`, async () => {
    postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths,
      group: team,
      operator: loginUser,
      text: `Hi, ![:Person](${loginUser.rcId})`
    });
    await h(t).glip(loginUser).bookmarkPosts(postId);
  });

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open a team and upload a image file with at mention otherUser', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  // conversation entry point
  await h(t).withLog('When I scroll to the image post and click the first image on the post', async () => {
    await t.wait(1e3); // wait conversation stream stage.
    await conversationPage.postItemById(postId).scrollIntoView();
    await t.click(conversationPage.postItemById(postId).img);
  });

  const previewer = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
    await previewer.shouldBeFullScreen();
  });

  await h(t).withLog('And the index of image should be (1/2)', async () => {
    await await t.expect(previewer.positionIndex.textContent).match(/(1\/2)/);
  });

  await h(t).withLog('When I click the close button', async () => {
    await previewer.clickCloseButton();
  });

  await h(t).withLog('Then The previewer dismissed ', async () => {
    await t.expect(previewer.exists).notOk();
  });

  const imageTabEntry = app.homePage.messageTab.rightRail.imagesEntry;
  const imageTab = app.homePage.messageTab.rightRail.imagesTab;
  await h(t).withLog(`Then the image tab should has the image file ${filesName[0]}`, async () => {
    await imageTabEntry.enter();
    await imageTab.shouldHasTitle(filesName[0]);
  });

  await h(t).withLog(`When I hover the image ${filesName[0]} item`, async () => {
    await imageTab.nthItem(0).nameShouldBe(filesName[0]);
    await t.hover(imageTab.nthItem(0).self)
  });

  await h(t).withLog('Then the mouser cursor should be not changed', async () => {
    const style = await imageTab.nthItem(0).self.style
    assert.notStrictEqual(style['cursor'], 'pointer', "the cursor style is little hand");
  });

  await h(t).withLog(`When I hover the image item ${filesName[0]} thumbnail`, async () => {
    await t.hover(imageTab.nthItem(0).thumbnail)
  });

  await h(t).withLog('Then the mouser cursor should be litter hand', async () => {
    const style = await imageTab.nthItem(0).thumbnail.style;
    assert.strictEqual(style['cursor'], 'pointer', "the cursor style is not little hand");
  });

  await h(t).withLog(`When I click the image thumbnail of the image file ${filesName[0]}`, async () => {
    await t.click(imageTab.nthItem(0).thumbnail)
  });

  const viewerDialog = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image viewer dialog show up and full screen', async () => {
    await viewerDialog.ensureLoaded();
    await viewerDialog.shouldBeFullScreen();
  });

  await h(t).withLog('When I close the image viewer dialog', async () => {
    await viewerDialog.clickCloseButton();
  });

  await h(t).withLog('And I upload a image file that thumbnail not support preview (psd)', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath[1]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend(20e3);
  });

  await h(t).withLog(`Then the image tab should has the image file ${filesName[1]}`, async () => {
    await imageTab.nthItem(0).nameShouldBe(filesName[1]);
    await imageTab.shouldHasTitle(filesName[1]);
  });

  await h(t).withLog(`When I hover the image item ${filesName[1]}`, async () => {
    await imageTab.nthItem(0).nameShouldBe(filesName[1]);
    await t.hover(imageTab.nthItem(0).self)
  });

  await h(t).withLog('Then the mouser cursor should be not changed', async () => {
    const style = await imageTab.nthItem(0).self.style;
    assert.notStrictEqual(style['cursor'], 'pointer', "the cursor style is little hand");
  });

  await h(t).withLog(`When I hover the image item ${filesName[1]} thumbnail`, async () => {
    await t.hover(imageTab.nthItem(0).previewIcon)
  });

  await h(t).withLog('Then the mouser cursor should be not changed', async () => {
    const style = await imageTab.nthItem(0).previewIcon.style
    assert.notStrictEqual(style['cursor'], 'pointer', "the cursor style is little hand");
  });

  await h(t).withLog(`When I click the image thumbnail of the image file ${filesName[1]}`, async () => {
    await t.click(imageTab.nthItem(0).previewIcon)
  });

  await h(t).withLog('Then the image viewer dialog should not open', async () => {
    await viewerDialog.ensureDismiss();
  });
});
