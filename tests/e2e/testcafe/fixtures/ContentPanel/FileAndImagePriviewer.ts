/*
 * @Author: Potar.He 
 * @Date: 2019-03-17 15:56:18 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-17 17:20:38
 */

import { formalName } from '../../libs/filter';
import * as _ from 'lodash';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from 'uuid';
import { IGroup } from '../../v2/models';

fixture('ContentPanel/FileAndImagePriviewer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Can close a full-screen image previewer by clicking close button/ESC', ['JPT-1347', 'P2', 'Potar.He', 'FileAndImagePriviewer']), async (t) => {
  const filesPath = '../../sources/1.png';
  const loginUser = h(t).rcData.mainCompany.users[4];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let postId: string;
  await h(t).withLog('And I open a team and upload a image file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    postId = await conversationPage.nthPostItem(-1).postId;
  });

  await h(t).withLog('And I send some text post to ensured the image is not on the bottom', async () => {
    for (const i of _.range(3)) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, loginUser);
    }
    await conversationPage.expectStreamScrollToBottom();
    await t.expect(conversationPage.posts.count).eql(4);
  });

  let scrollTop: number;
  await h(t).withLog('When I scroll to the image post and click the image on the post', async () => {
    await t.wait(1e3); // wait conversation stream stage.
    await conversationPage.postItemById(postId).scrollIntoView();
    scrollTop = await conversationPage.scrollDiv.scrollTop;
    console.log(scrollTop)
    await t.debug()
    await t.click(conversationPage.postItemById(postId).img);
  });

  const previewer = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
  });

  await h(t).withLog('When I click the close button', async () => {
    await previewer.clickCloseButton();
  });

  await h(t).withLog('Then The previewer dismissed ', async () => {
    await t.expect(previewer.exists).notOk();
  });

  await h(t).withLog('And  Return to the conversation and stay where it was', async () => {
    await conversationPage.expectStreamScrollToY(scrollTop);
  });

  await h(t).withLog('When I click the image on the post', async () => {
    await t.click(conversationPage.postItemById(postId).img);
  });

  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
  });

  // press "esc" not yet finish feature
  // await h(t).withLog(`When I press"esc" key on keyboard `, async () => {
  //   await previewer.quitByPressEsc();
  // });

  // await h(t).withLog('Then The previewer dismissed ', async () => {
  //   await t.expect(previewer.exists).notOk();
  // });

  // await h(t).withLog('And  Return to the conversation and stay where it was', async () => {
  //   await conversationPage.expectStreamScrollToY(scrollTop);
  // });

})
