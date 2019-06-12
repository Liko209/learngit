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
  caseIds: ['JPT-2038'],
  keywords: ['FilesViewer'],
  maintainers: ['Potar.He']
})('The file viewer can be opened after the file is processed.', async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  const filePaths = './sources/preview_files/2Pages.doc';
  const filesName = '2Pages.doc';

  await h(t).glip(loginUser).init();

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

  /** conversation entry point */
  await h(t).withLog('When I click the file thumbnail', async () => {
    await t.click(conversationPage.postItemById(postId).fileThumbnail);
  });

  const viewerDialog = app.homePage.viewerDialog;
  await h(t).withLog('Then the file previewer should be showed', async () => {
    await viewerDialog.ensureLoaded();
    await viewerDialog.shouldBeFullScreen();
  });

  await h(t).withLog('When I click the close button', async () => {
    await viewerDialog.clickCloseButton();
  });

  await h(t).withLog('Then The previewer dismissed ', async () => {
    await viewerDialog.ensureDismiss()
  });

  const fileTab = app.homePage.messageTab.rightRail.filesTab;
  await h(t).withLog(`Then the file tab should has the file named: [filesName]`, async (step) => {
    step.setMetadata('filesName', filesName);
    await app.homePage.messageTab.rightRail.filesEntry.enter();
    await fileTab.shouldHasTitle(filesName);
  });

  await h(t).withLog(`When I click the file thumbnail of the file`, async () => {
    await t.click(fileTab.nthItem(0).fileThumbnail)
  });

  await h(t).withLog('Then the file viewer dialog show up and full screen', async () => {
    await viewerDialog.ensureLoaded();
    await viewerDialog.shouldBeFullScreen();
  });
});


