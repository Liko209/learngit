/*
 * @Author: Potar.He
 * @Date: 2019-03-17 15:56:18
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-18 18:40:03
 */

import { formalName } from '../../libs/filter';
import * as _ from 'lodash';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from 'uuid';
import { IGroup } from '../../v2/models';

fixture('ContentPanel/FileAndImagePreviewer')
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

  // press "esc" not yet finish feature
  // await h(t).withLog('When I click the image on the post', async () => {
  //   await t.click(conversationPage.postItemById(postId).img);
  // });

  // await h(t).withLog('Then the image previewer should be showed', async () => {
  //   await previewer.ensureLoaded();
  // });

  // await h(t).withLog(`When I press "esc" key on keyboard `, async () => {
  //   await previewer.quitByPressEsc();
  // });

  // await h(t).withLog('Then The previewer dismissed ', async () => {
  //   await t.expect(previewer.exists).notOk();
  // });

  // await h(t).withLog('And  Return to the conversation and stay where it was', async () => {
  //   await conversationPage.expectStreamScrollToY(scrollTop);
  // });

});

// skip due to https://jira.ringcentral.com/browse/FIJI-4188
test(formalName('Should scroll to the bottom automatically when reveived new messages then close the dialog', ['JPT-1348', 'P2', 'Potar.He', 'FileAndImagePreviewer']), async (t) => {
  const filesPath = ['../../sources/1.png', '../../sources/2.png'];
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5]

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, anotherUser]
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
  await h(t).withLog('And I open a team and upload some image files', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    for (const i of _.range(filesPath.length)) {
      await conversationPage.uploadFilesToMessageAttachment(filesPath[i]);
      await conversationPage.pressEnterWhenFocusOnMessageInputArea();
      await conversationPage.nthPostItem(-1).waitForPostToSend();
    }
    postId = await conversationPage.nthPostItem(0).postId;
  });

  await h(t).withLog('And I receive a text post to ensured the images is not on the bottom', async () => {
    await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, anotherUser);
    await t.expect(conversationPage.posts.count).eql(3);
    await conversationPage.expectStreamScrollToBottom();
  });

  await h(t).withLog('When I scroll to the first image post and click the first image', async () => {
    await t.wait(1e3); // wait conversation stream stage.
    await conversationPage.postItemById(postId).scrollIntoView();
    await t.click(conversationPage.postItemById(postId).img);
  });

  const previewer = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
  });


  await h(t).withLog('When I receive new message from I send by API', async () => {
    await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, loginUser);
    await t.expect(conversationPage.posts.count).eql(4);
  });

  await h(t).withLog('and I click the close button', async () => {
    await previewer.clickCloseButton();
  });

  await h(t).withLog('Then Automatically scroll to the bottom of the conversation', async () => {
    await conversationPage.expectStreamScrollToBottom();
  });
});



test(formalName('Title bar should sync dynamically', ['JPT-1351', 'P2', 'Potar.He', 'FileAndImagePreviewer']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

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

  const filesPath = '../../sources/1.png';
  const fileName = '1.png';

  let postId: string, fileId: string, senderName: string;
  await h(t).withLog('And I open a team and upload a image files', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    postId = await conversationPage.nthPostItem(-1).postId;
    fileId = await h(t).glip(loginUser).getFilesIdsFromPostId(postId);
    senderName = await conversationPage.nthPostItem(-1).name.textContent;
  });

  await h(t).withLog('When I scroll to the first image post and click the first image', async () => {
    await t.wait(1e3); // wait conversation stream stage.
    await conversationPage.postItemById(postId).scrollIntoView();
    await t.click(conversationPage.postItemById(postId).img);
  });

  const previewer = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
    await t.expect(previewer.senderName.textContent).eql(senderName);
    await t.expect(previewer.fileName.textContent).eql(fileName);
  });

  const sendTime = await previewer.sendTime.textContent;

  const newFirstName = H.uuid();
  const newFileName = uuid();
  let newSenderName: string;
  await h(t).withLog('When I update sender name and file name via api', async () => {
    await h(t).glip(loginUser).updatePerson({ 'first_name': newFirstName });
    newSenderName = await h(t).glip(loginUser).getPersonPartialData('display_name');
    await h(t).glip(loginUser).updateFileName(fileId, newFileName);
  });

  await h(t).withLog('Then the sender name and file name should be sync dynamically ', async () => {
    await t.expect(previewer.senderName.textContent).eql(newSenderName);
    await t.expect(previewer.fileName.textContent).eql(newFileName);
  });

  await h(t).withLog('And send time is not changed', async () => {
    await t.expect(previewer.sendTime.textContent).eql(sendTime);
  });

  await h(t).withLog('Reset user name', async () => {
    await h(t).glip(loginUser).updatePerson({ first_name: 'John' }); // reset first_name
  });
});
