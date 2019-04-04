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
import * as assert from 'assert';

fixture('ImageViewer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Open the image thumbnail that support preview', ['Potar.He', 'P2', 'JPT-1465', 'JPT-1466', 'JPT-1467']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.png', '../../sources/1.psd'];
  const filesName = ['1.png', '1.psd'];
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

  const imageTabEntry = app.homePage.messageTab.rightRail.imagesEntry;
  const imageTab = app.homePage.messageTab.rightRail.imagesTab;
  await h(t).withLog(`Then the image tab should has the image file ${filesName[0]}`, async () => {
    await imageTabEntry.enter();
    await imageTab.shouldHasTitle(filesName[0]);
  });

  await h(t).withLog(`When I hover the image item ${filesName[0]}`, async () => {
    await imageTab.nthItem(0).nameShouldBe(filesName[0]);
    await t.hover(imageTab.nthItem(0).self)
  });

  await h(t).withLog('Then the mouser cursor should be not changed', async () => {
    const style = await imageTab.nthItem(0).self.style
    assert.strictEqual(style['cursor'], undefined, "the item has some style");
  });

  await h(t).withLog(`When I hover the image item ${filesName[0]} thumbnail`, async () => {
    await t.hover(imageTab.nthItem(0).thumbnail)
  });

  await h(t).withLog('Then the mouser cursor should be not changed', async () => {
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

  await h(t).withLog(`When I hover the image item ${filesName[0]}`, async () => {
    await imageTab.nthItem(0).nameShouldBe(filesName[0]);
    await t.hover(imageTab.nthItem(0).self)
  });

  await h(t).withLog('Then the mouser cursor should be not changed', async () => {
    const style = await imageTab.nthItem(0).self.style;
    assert.strictEqual(style['cursor'], undefined, "the item has some style");
  });

  await h(t).withLog(`When I hover the image item ${filesName[1]} thumbnail`, async () => {
    await t.hover(imageTab.nthItem(0).thumbnail)
  });

  await h(t).withLog('Then the mouser cursor should be not changed', async () => {
    const style = await imageTab.nthItem(0).thumbnail.style
    assert.strictEqual(style['cursor'], undefined, "the item has some style");
  });

  await h(t).withLog(`When I click the image thumbnail of the image file ${filesName[0]}`, async () => {
    await t.click(imageTab.nthItem(0).thumbnail)
  });

  await h(t).withLog('Then the image viewer dialog should not open', async () => {
    await viewerDialog.ensureDismiss();
  });
});
