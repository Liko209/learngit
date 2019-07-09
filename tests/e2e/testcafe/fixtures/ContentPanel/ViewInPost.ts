/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-06-06 10:55:37
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from "../../v2/models";
import { v4 as uuid } from 'uuid';
import { IGroup } from '../../v2/models';

fixture('ContentPanel/ViewInPost')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2368'],
  maintainers: ['Wayne.Zhou'],
  keywords: ['ContentPanel/ViewInPost']
})(`Able to go to post from image/file viewer by clicking view in post`, async (t) => {
  const imagePath = '../../sources/1.png';
  const image2Path = '../../sources/2.png';
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let postId = '';
  await h(t).withLog('And I open the team and upload a image', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(imagePath);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    postId = await app.homePage.messageTab.conversationPage.nthPostItem(-1).postId;
  });

  await h(t).withLog('And I send messages', async () => {
    for (let i = 0; i !== 10; ++i){
      await conversationPage.sendMessage(`message${i}`);
    }
  });

  await h(t).withLog('And I send another image', async () => {
    await conversationPage.uploadFilesToMessageAttachment(image2Path);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  })

  const viewerDialog = app.homePage.viewerDialog;
  const rightRail = app.homePage.messageTab.rightRail;
  let imageItem = rightRail.imagesTab.nthItem(-1);
  await h(t).withLog('When I open image viewer from right rail', async () => {
      await rightRail.imagesEntry.enter()
      await rightRail.imagesEntry.shouldBeOpened();
      await t.click(imageItem.imageThumbnail)
      await viewerDialog.ensureLoaded();
  })

  const moreActionOnViewer = app.homePage.moreActionOnViewer;
  await h(t).withLog('And I click view in post', async () => {
    await moreActionOnViewer.ensureLoaded();
    await moreActionOnViewer.clickMore();
    await moreActionOnViewer.clickViewInPost();
  })

  const postItem = app.homePage.messageTab.conversationPage.postItemById(postId);
  await h(t).withLog('Then viewer should be closed and jump to corresponding post', async () => {
    await t.expect(viewerDialog.exists).notOk();
    await postItem.shouldBeHighLight();
    await conversationPage.postCardByIdShouldBeOnTheTop(postId);
  })
});
