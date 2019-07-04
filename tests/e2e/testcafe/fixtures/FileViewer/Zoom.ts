/*
 * @Author: Potar.He 
 * @Date: 2019-06-12 20:04:51 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-06-13 10:06:44
 */

import { v4 as uuid } from 'uuid';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';
import * as assert from 'assert';

fixture('fileViewer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1248', 'JPT-1249'],
  keywords: ['FilesViewer'],
  maintainers: ['Potar.He']
})('The image should be proportionally scaled down/up by 10% with each click on the zoom out/in icon', async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  const filePaths = './sources/preview_files/2Pages.doc';

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  let postId: string;
  await h(t).withLog(`Given I have a team named {teamName} before login`, async (step) => {
    step.setMetadata('teamName', team.name)
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('And send a doc file in the team', async () => {
    postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths,
      group: team,
      operator: loginUser,
      text: uuid()
    });
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open the team', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I  should be able to see an indicator on the file thumbnail.', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.postItemById(postId).fileThumbnail.exists).ok();
  });

  await h(t).withLog('When I click the file thumbnail', async () => {
    await t.click(conversationPage.postItemById(postId).fileThumbnail);
  });

  const viewerDialog = app.homePage.viewerDialog;
  await h(t).withLog('Then the file previewer should be showed', async () => {
    await viewerDialog.ensureLoaded();
    await viewerDialog.shouldBeFullScreen();
  });

  let zoomScale = "";
  let pageWidth;
  let pageHeight;
  await h(t).withLog('And page viewer scale is {zoomScale}, first page width: {pageWidth}, height: {pageHeight} ', async (step) => {
    zoomScale = await viewerDialog.zoomScale.textContent;
    pageWidth = await viewerDialog.pageContentWraps.clientWidth;
    pageHeight = await viewerDialog.pageContentWraps.clientHeight;
    step.initMetadata({
      zoomScale,
      pageWidth: pageWidth.toString(),
      pageHeight: pageHeight.toString()
    })
  });

  await h(t).withLog('When I click zoom in icon', async () => {
    await viewerDialog.clickZoomInButton();
  });

  zoomScale = scaleChange(zoomScale, true);
  const originWidth = pageWidth / +zoomScale.trim().replace('%', "") * 100;
  const originHeight = pageHeight / +zoomScale.trim().replace('%', "") * 100;

  await h(t).withLog('Then The image should be proportionally scaled up by 10%: {zoomScale}, width:{newWidth}, height {newHeight} ', async (step) => {
    step.setMetadata('zoomScale', zoomScale)
    let newWidth: number, newHeight: number;
    await H.retryUntilPass(async () => {
      newWidth = await viewerDialog.pageContentWraps.clientWidth;
      newHeight = await viewerDialog.pageContentWraps.clientHeight;
      step.initMetadata({
        zoomScale,
        newWidth: newWidth.toString(),
        newHeight: newHeight.toString()
      })
      const widthChange = (newWidth - pageWidth) / originWidth;
      assert.ok(Math.round(widthChange * 10) == 1, `width is not 10% change: ${widthChange}`);
      const heightChange = (newHeight - pageHeight) / originHeight;
      assert.ok(Math.round(heightChange * 10) == 1, `height is not 10% change: ${heightChange}`);
    })
    pageWidth = newWidth;
    pageHeight = newHeight;
  });

  await h(t).withLog('And the current zoom percentage +10%: {zoomScale}', async (step) => {
    step.setMetadata('zoomScale', zoomScale)
    await t.expect(viewerDialog.zoomScale.textContent).eql(zoomScale);
  });

  await h(t).withLog('When I click zoom out icon', async () => {
    await viewerDialog.clickZoomOutButton();
  });

  zoomScale = scaleChange(zoomScale, false);
  await h(t).withLog('Then The image should be proportionally scaled down by 10%: {zoomScale}, width:{newWidth}, height {newHeight} ', async (step) => {
    await H.retryUntilPass(async () => {
      const newWidth = await viewerDialog.pageContentWraps.clientWidth;
      const newHeight = await viewerDialog.pageContentWraps.clientHeight;
      step.initMetadata({
        zoomScale,
        newWidth: newWidth.toString(),
        newHeight: newHeight.toString()
      })
      const widthChange = (newWidth - pageWidth) / originWidth;
      assert.ok(Math.round(widthChange * 10) == -1, `width is not 10% change: ${widthChange}`);
      const heightChange = (newHeight - pageHeight) / originHeight;
      assert.ok(Math.round(heightChange * 10) == -1, `height is not 10% change: ${heightChange}`);
    });
  });

  await h(t).withLog('And the current zoom percentage -10%: {zoomScale}', async (step) => {
    step.setMetadata('zoomScale', zoomScale)
    await t.expect(viewerDialog.zoomScale.textContent).eql(zoomScale);
  });
});

function scaleChange(percent: string, isPlus: boolean) {
  let currentPercent = +percent.trim().replace('%', "");
  if (isPlus) {
    return `${currentPercent + 10}%`
  }
  return `${currentPercent - 10}%`
}


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1409'],
  keywords: ['FilesViewer'],
  maintainers: ['Potar.He']
})('Reset zoom button is displayed when user zoom in/out the image/file', async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  const filePaths = './sources/preview_files/2Pages.doc';

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  let postId: string;
  await h(t).withLog(`Given I have a team named {teamName} before login`, async (step) => {
    step.setMetadata('teamName', team.name)
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('And send a doc file in the team', async () => {
    postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths,
      group: team,
      operator: loginUser,
      text: uuid()
    });
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open the team', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I  should be able to see an indicator on the file thumbnail.', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.postItemById(postId).fileThumbnail.exists).ok();
  });

  await h(t).withLog('When I click the file thumbnail', async () => {
    await t.click(conversationPage.postItemById(postId).fileThumbnail);
  });

  const viewerDialog = app.homePage.viewerDialog;
  await h(t).withLog('Then the file previewer should be showed', async () => {
    await viewerDialog.ensureLoaded();
    await viewerDialog.shouldBeFullScreen();
  });

  await h(t).withLog('And Reset zoom button is disable.', async () => {
    await viewerDialog.viewerResetButtonShouldBeDisabled()
  });

  let zoomScale = "";
  let pageWidth;
  let pageHeight;

  await h(t).withLog('And page viewer scale is {zoomScale}, first page width: {pageWidth}, height: {pageHeight} ', async (step) => {
    zoomScale = await viewerDialog.zoomScale.textContent;
    pageWidth = await viewerDialog.pageContentWraps.clientWidth;
    pageHeight = await viewerDialog.pageContentWraps.clientHeight;
    step.initMetadata({
      zoomScale,
      pageWidth: pageWidth.toString(),
      pageHeight: pageHeight.toString()
    })
  });


  await h(t).withLog('When I click zoom in icon', async () => {
    await viewerDialog.clickZoomInButton();
  });

  await h(t).withLog('And Reset zoom button is enabled.', async () => {
    await viewerDialog.viewerResetButtonShouldBeEnabled()
  });

  let newZoomScale = scaleChange(zoomScale, true);
  await h(t).withLog('And the current zoom percentage +10%: {newZoomScale}', async (step) => {
    step.setMetadata('newZoomScale', newZoomScale)
    await t.expect(viewerDialog.zoomScale.textContent).eql(newZoomScale);
  });

  await h(t).withLog('When I click reset zoom button', async () => {
    await viewerDialog.clickResetButton();
  });

  await h(t).withLog('And Reset zoom button is disable.', async () => {
    await viewerDialog.viewerResetButtonShouldBeDisabled()
  });

  await h(t).withLog('And page viewer scale is {zoomScale}, first page width: {pageWidth}, height: {pageHeight} ', async (step) => {
    step.initMetadata({
      zoomScale,
      pageWidth: pageWidth.toString(),
      pageHeight: pageHeight.toString()
    })
    await H.retryUntilPass(async () => {
      const newWidth = await viewerDialog.pageContentWraps.clientWidth;
      const newHeight = await viewerDialog.pageContentWraps.clientHeight;
      await t.expect(viewerDialog.zoomScale.textContent).eql(zoomScale);
      assert.ok(newWidth == pageWidth, "width is not reset");
      assert.ok(newHeight == pageHeight, "width is not reset");
    })
  });

  await h(t).withLog('When I click zoom out icon', async () => {
    await viewerDialog.clickZoomOutButton();
  });

  await h(t).withLog('And Reset zoom button is enabled.', async () => {
    await viewerDialog.viewerResetButtonShouldBeEnabled()
  });

  newZoomScale = scaleChange(zoomScale, false);
  await h(t).withLog('And the current zoom percentage -10%: {newZoomScale}', async (step) => {
    step.setMetadata('newZoomScale', newZoomScale)
    await t.expect(viewerDialog.zoomScale.textContent).eql(newZoomScale);
  });

  await h(t).withLog('When I click reset zoom button', async () => {
    await viewerDialog.clickResetButton();
  });

  await h(t).withLog('And Reset zoom button is disable.', async () => {
    await viewerDialog.viewerResetButtonShouldBeDisabled()
  });

  await h(t).withLog('And page viewer scale is {zoomScale}, first page width: {pageWidth}, height: {pageHeight} ', async (step) => {
    step.initMetadata({
      zoomScale,
      pageWidth: pageWidth.toString(),
      pageHeight: pageHeight.toString()
    })
    await H.retryUntilPass(async () => {
      const newWidth = await viewerDialog.pageContentWraps.clientWidth;
      const newHeight = await viewerDialog.pageContentWraps.clientHeight;
      await t.expect(viewerDialog.zoomScale.textContent).eql(zoomScale);
      assert.ok(newWidth == pageWidth, "width is not reset");
      assert.ok(newHeight == pageHeight, "width is not reset");
    })
  });

});