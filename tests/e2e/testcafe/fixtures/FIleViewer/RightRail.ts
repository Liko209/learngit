/*
 * @Author: Potar.He 
 * @Date: 2019-06-10 18:53:22 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-06-10 19:21:19
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
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
  await h(t).withLog(`Given I have a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I have a mention post (also bookmark it) with two file files in the team`, async () => {
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

  await h(t).withLog('And I open a team and upload a file file with at mention otherUser', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  // conversation entry point
  // await h(t).withLog('When I scroll to the file post and click the first file on the post', async () => {
  //   await t.wait(1e3); // wait conversation stream stage.
  //   await conversationPage.postItemById(postId).scrollIntoView();
  //   await t.click(conversationPage.postItemById(postId).img);
  // });

  const viewerDialog = app.homePage.viewerDialog;
  // await h(t).withLog('Then the file previewer should be showed', async () => {
  //   await viewerDialog.ensureLoaded();
  //   await viewerDialog.shouldBeFullScreen();
  // });

  // await h(t).withLog('And the index of file should be (1/2)', async () => {
  //   await await t.expect(viewerDialog.positionIndex.textContent).match(/(1\/2)/);
  // });

  // await h(t).withLog('When I click the close button', async () => {
  //   await viewerDialog.clickCloseButton();
  // });

  // await h(t).withLog('Then The previewer dismissed ', async () => {
  //   await viewerDialog.ensureDismiss()
  // });

  const fileTabEntry = app.homePage.messageTab.rightRail.filesEntry;
  const fileTab = app.homePage.messageTab.rightRail.filesTab;
  await h(t).withLog(`Then the file tab should has the file file ${filesName}`, async () => {
    await fileTabEntry.enter();
    await fileTab.shouldHasTitle(filesName);
  });

  await h(t).withLog(`When I click the file thumbnail of the file file ${filesName}`, async () => {
    await t.click(fileTab.nthItem(0).docIcon)
  });

  await h(t).withLog('Then the file viewer dialog show up and full screen', async () => {
    await viewerDialog.ensureLoaded();
    await viewerDialog.shouldBeFullScreen();
  });
});


