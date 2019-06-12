/*
 * @Author: Potar.He 
 * @Date: 2019-06-10 18:53:22 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-06-10 19:21:19
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
  caseIds: ['JPT-2153'],
  keywords: ['FilesViewer'],
  maintainers: ['Potar.He']
})('Check if the user should be able to go to a specified page', async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  const filePaths = './sources/preview_files/2Pages.doc';
  const destinationPage = '2';
  const indexPage = '(2/2)';

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

  await h(t).withLog('When I Change the page by changing the value {destinationPage} on index field.', async (step) => {
    step.setMetadata('destinationPage', destinationPage)
    await t.typeText(viewerDialog.goToPageInput, destinationPage);
  });

  await h(t).withLog('Then User should be able to go to a specified page {destinationPage}', async (step) => {
    step.setMetadata('destinationPage', destinationPage)
    await t.expect(viewerDialog.positionIndex.textContent).eql(indexPage);
    await t.expect(viewerDialog.viewerPages.nth(1).visible).ok();
    await t.expect(viewerDialog.thumbnails.nth(1).hasClass('selected')).ok();
  });

});
