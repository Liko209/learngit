/*
 * @Author: Potar.He
 * @Date: 2019-03-17 15:56:18
 * @Last Modified by:
 * @Last Modified time: 2019-07-05 15:01:28
 */

import { formalName } from '../../libs/filter';
import * as _ from 'lodash';
import * as assert from 'assert';
import * as moment from 'moment';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from 'uuid';
import { IGroup, ITestMeta } from '../../v2/models';
import { ClientFunction } from 'testcafe';



fixture('ImageViewer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['p2'],
  caseIds: ['JPT-1345'],
  maintainers: ['potar.he'],
  keywords: ['Image viewer dialog']
})('The display of a full-screen image previewer', async (t) => {
  const filePaths = ['./sources/1.png', './sources/2.png', './sources/3.png'];
  const filename = '2.png'
  const currentIndexReg = /\(2\/3\)$/;
  const timeFormat = "M/D/YYYY h:mm A";

  const loginUser = h(t).rcData.mainCompany.users[4];
  const anotherUser = h(t).rcData.mainCompany.users[5];

  await h(t).glip(loginUser).init();
  const senderName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);


  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  let postId: string;
  await h(t).withLog(`Given I have a team named {teamName} before login`, async (step) => {
    step.setMetadata('teamName', team.name)
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I have a post with 3 images in the team`, async () => {
    postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths,
      group: team,
      operator: anotherUser,
    })
  });

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open a team and upload a image file with at mention otherUser', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I scroll to the image post and click the second image on the post', async () => {
    await t.wait(1e3); // wait conversation stream stage.
    await conversationPage.postItemById(postId).waitImageVisible();
    await t.click(conversationPage.postItemById(postId).img.nth(1));
  });

  const viewerDialog = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image previewer should be showed', async () => {
    await viewerDialog.ensureLoaded();
    await viewerDialog.shouldBeFullScreen();
  }, true);

  // header
  await h(t).withLog("And display sender's avatar", async () => {
    await t.expect(viewerDialog.avatar.exists).ok();
  });

  await h(t).withLog("And display sender's name: {senderName}", async (step) => {
    step.setMetadata('senderName', senderName);
    await t.expect(viewerDialog.senderName.textContent).eql(senderName);
  });

  await h(t).withLog("And display send date & time (follow browser locale and date/time format)", async () => {
    const sendTime = await viewerDialog.sendTime.textContent;
    assert.ok(moment(sendTime, timeFormat).format(timeFormat) == sendTime, `${sendTime} should be formated to: ${timeFormat}`)
  });

  await h(t).withLog('And display image file name should be {filename}', async (step) => {
    step.setMetadata('filename', filename);
    await t.expect(viewerDialog.fileName.textContent).eql(filename);
  });

  await h(t).withLog('And display the index of image should be {index}', async (step) => {
    step.setMetadata('index', '(2/3)');
    await t.expect(viewerDialog.positionIndex.textContent).match(currentIndexReg);
  });

  await h(t).withLog('And display Action menu: download button', async () => {
    await t.expect(viewerDialog.downloadButton.exists).ok();
  });

  await h(t).withLog('And display close button', async () => {
    await t.expect(viewerDialog.closeButton.exists).ok();
  });

  // container
  await h(t).withLog('And display image', async () => {
    await t.expect(viewerDialog.imageCanvas.exists).ok();
  });

  // other interactive
  await h(t).withLog('When I hover the image', async () => {
    await viewerDialog.hoverPreviewer();
  });

  await h(t).withLog('Then display previous button and next button', async () => {
    await t.expect(viewerDialog.previousButton.visible).ok();
    await t.expect(viewerDialog.forwardButton.visible).ok();
  });

  await h(t).withLog('And display zoom in/out button', async () => {
    await t.expect(viewerDialog.zoomInButton.visible).ok();
    await t.expect(viewerDialog.zoomOutButton.visible).ok();
  });

  await h(t).withLog('And display current zoom percentage: 100%', async () => {
    await t.expect(viewerDialog.zoomPercentageText).eql('100%');
  });
});


test(formalName('Can close a full-screen image previewer by clicking close button/ESC', ['JPT-1347', 'P2', 'Potar.He', 'FileAndImagePriviewer']), async (t) => {
  const filePaths = ['./sources/1.png', './sources/2.png'];
  const loginUser = h(t).rcData.mainCompany.users[4];
  const anotherUser = h(t).rcData.mainCompany.users[5];
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  let postId: string;
  await h(t).withLog(`Given I have a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I have a mention post (also bookmark it) with two image files in the team`, async () => {
    postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths,
      group: team,
      operator: anotherUser,
      text: `Hi, ![:Person](${loginUser.rcId})`
    });
    await h(t).glip(loginUser).bookmarkPosts(postId);;
  });

  await h(t).withLog('And I send some text post to ensured the image is not on the bottom', async () => {
    for (const i of _.range(3)) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, loginUser);
    }
  });;

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // conversation entry point
  await h(t).withLog('And I open a team', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  let scrollTop: number;
  await h(t).withLog('When I scroll to the image post and click the first image on the post', async () => {
    await t.wait(1e3); // wait conversation stream stage.
    await conversationPage.postItemById(postId).scrollIntoView();
    scrollTop = await conversationPage.scrollDiv.scrollTop;
    await t.click(conversationPage.postItemById(postId).img);
  });

  const previewer = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
    await previewer.shouldBeFullScreen();
  });

  await h(t).withLog('And the index of image should be (1/2)', async () => {
    await t.expect(previewer.positionIndex.textContent).match(/(1\/2)/);
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

  await h(t).withLog(`When I press "esc" key on keyboard `, async () => {
    await previewer.quitByPressEsc();
  });

  await h(t).withLog('Then The previewer dismissed ', async () => {
    await t.expect(previewer.exists).notOk();
  });

  await h(t).withLog('And  Return to the conversation and stay where it was', async () => {
    await conversationPage.expectStreamScrollToY(scrollTop);
  });

  // bookmark page enter point
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  await h(t).withLog('When I enter bookmark and click the second image on the post', async () => {
    await app.homePage.messageTab.bookmarksEntry.enter();
    await bookmarkPage.postItemById(postId).scrollIntoView();
    scrollTop = await bookmarkPage.scrollDiv.scrollTop;
    await t.click(bookmarkPage.postItemById(postId).img.nth(1));
  });

  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
    await previewer.shouldBeFullScreen();
  });

  await h(t).withLog('And the index of image should be (2/2)', async () => {
    await t.expect(previewer.positionIndex.textContent).match(/(2\/2)/);
  });

  await h(t).withLog('When I click the close button', async () => {
    await previewer.clickCloseButton();
  });

  await h(t).withLog('Then The previewer dismissed ', async () => {
    await t.expect(previewer.exists).notOk();
  });

  await h(t).withLog('And  Return to the conversation and stay where it was', async () => {
    await bookmarkPage.expectStreamScrollToY(scrollTop);
  });

  await h(t).withLog('When I click the image on the post', async () => {
    await t.click(bookmarkPage.postItemById(postId).img);
  });

  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
  });

  await h(t).withLog(`When I press "esc" key on keyboard `, async () => {
    await previewer.quitByPressEsc();
  });

  await h(t).withLog('Then The previewer dismissed ', async () => {
    await t.expect(previewer.exists).notOk();
  });

  await h(t).withLog('And  Return to the conversation and stay where it was', async () => {
    await bookmarkPage.expectStreamScrollToY(scrollTop);
  });

  // at mention enter point
  const atMentionPage = app.homePage.messageTab.mentionPage;
  await h(t).withLog('When I enter atMentionPage and click the image on the post', async () => {
    await app.homePage.messageTab.mentionsEntry.enter();
    await atMentionPage.postItemById(postId).scrollIntoView();
    await t.click(atMentionPage.postItemById(postId).img);
  });

  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
    await previewer.shouldBeFullScreen();
  });

  await h(t).withLog('And the index of image should be (1/2)', async () => {
    await t.expect(previewer.positionIndex.textContent).match(/(1\/2)/);
  });

  await h(t).withLog(`When I press "esc" key on keyboard `, async () => {
    await previewer.quitByPressEsc();
  });

  await h(t).withLog('Then The previewer dismissed ', async () => {
    await t.expect(previewer.exists).notOk();
  });


  await h(t).withLog('And  Return to the conversation and stay where it was', async () => {
    await atMentionPage.expectStreamScrollToY(scrollTop);
  });

  await h(t).withLog('When I click the image on the post', async () => {
    await t.click(atMentionPage.postItemById(postId).img);
  });

  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
  });

  await h(t).withLog(`When I press "esc" key on keyboard `, async () => {
    await previewer.quitByPressEsc();
  });

  await h(t).withLog('Then The previewer dismissed ', async () => {
    await t.expect(previewer.exists).notOk();
  });

  await h(t).withLog('And  Return to the conversation and stay where it was', async () => {
    await atMentionPage.expectStreamScrollToY(scrollTop);
  });

  // search content
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog('When I open the team and search file name 1.png in this conversation', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.header.searchBar.clickSelf();
    await searchDialog.typeSearchKeyword('1.png');
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog('Then I should found the post with the images in message tab', async () => {
    await searchDialog.fullSearchPage.messagesTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog('When I click the first image', async () => {
    await searchDialog.fullSearchPage.messagesTab.postItemById(postId).scrollIntoView();
    scrollTop = await searchDialog.fullSearchPage.messagesTab.scrollDiv.scrollTop;
    await t.click(searchDialog.fullSearchPage.messagesTab.postItemById(postId).img.nth(0));
  });

  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
    await previewer.shouldBeFullScreen();
  });

  await h(t).withLog('And the index of image should be (1/2)', async () => {
    await t.expect(previewer.positionIndex.textContent).match(/(1\/2)/);
  });

  await h(t).withLog('When I click the close button', async () => {
    await previewer.clickCloseButton();
  });

  await h(t).withLog('Then The previewer dismissed ', async () => {
    await t.expect(previewer.exists).notOk();
  });

  await h(t).withLog('And  Return to the conversation and stay where it was', async () => {
    await searchDialog.fullSearchPage.messagesTab.expectStreamScrollToY(scrollTop);
  });

  await h(t).withLog('When I click the image on the post', async () => {
    await t.click(searchDialog.fullSearchPage.messagesTab.postItemById(postId).img.nth(0));
  });

  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
  });

  await h(t).withLog(`When I press "esc" key on keyboard `, async () => {
    await previewer.quitByPressEsc();
  });

  await h(t).withLog('Then The previewer dismissed ', async () => {
    await t.expect(previewer.exists).notOk();
  });

  await h(t).withLog('And  Return to the conversation and stay where it was', async () => {
    await searchDialog.fullSearchPage.messagesTab.expectStreamScrollToY(scrollTop);
  });

});

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
    for (const i of _.range(4)) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, anotherUser);
    }
  });

  await h(t).withLog('When I scroll to the first image post and click the first image', async () => {
    await conversationPage.scrollUpToViewPostById(postId);
    await t.click(conversationPage.postItemById(postId).img);
  });

  const previewer = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image previewer should be showed', async () => {
    await previewer.ensureLoaded();
  });


  await h(t).withLog('When I receive new message from I send by API', async () => {
    await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, loginUser);
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

  await h(t).withLog(`Given I have a team named "{name}" before login`, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  const filePaths = './sources/1.png';
  const fileName = '1.png';

  let postId: string, fileId: string, senderName: string;
  await h(t).withLog(`And I send a file in the team`, async () => {
    await h(t).scenarioHelper.createPostWithTextAndFiles({
      filePaths,
      group: team,
      operator: loginUser,
    }).then(res => {
      postId = res.data.id;
      fileId = res.data.attachments[0].id
    });
  });


  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  await h(t).withLog('And I open the team', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.postItemById(postId).waitImageVisible();
    senderName = await conversationPage.postItemById(postId).name.textContent;
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


test.meta(<ITestMeta>{
  priority: ['p2'],
  caseIds: ['JPT-1365'],
  maintainers: ['potar.he'],
  keywords: ['Image viewer dialog']
})('Dialog responsive behavior when resize the window', async (t) => {
  if (await H.isElectron() || await H.isEdge()) {
    await h(t).log('This case (resize) is not working on Electron or Edge!');
    return;
  }

  const filePaths = './sources/1.png';
  const loginUser = h(t).rcData.mainCompany.users[4];
  const anotherUser = h(t).rcData.mainCompany.users[5];
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  let postId: string;
  await h(t).withLog(`Given I have a team named {teanName} before login`, async (step) => {
    step.setMetadata('teamName', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I have a post with a image in the team`, async () => {
    postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths,
      group: team,
      operator: anotherUser,
    });
  });


  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  // conversation entry point
  await h(t).withLog('And I open this team', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });


  await h(t).withLog('When I click the image of post', async () => {
    await t.click(conversationPage.postItemById(postId).img);
  });

  const viewerDialog = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('Then the image previewer should be showed', async () => {
    await viewerDialog.ensureLoaded();
  });

  await h(t).withLog("And display sender's avatar", async () => {
    await t.expect(viewerDialog.avatar.exists).ok();
  });

  await h(t).withLog("And display sender's name", async (step) => {
    await t.expect(viewerDialog.senderName.exists).ok();
  });

  await h(t).withLog("And display send time", async () => {
    await t.expect(viewerDialog.sendTime.exists).ok();
  });

  await h(t).withLog('When I resize browser window width < 640px', async () => {
    const windowHeight = await ClientFunction(() => window.innerHeight || document.body.clientHeight)();
    await t.resizeWindow(639, windowHeight);
  });

  await h(t).withLog("Then display sender's avatar", async () => {
    await t.expect(viewerDialog.avatar.exists).ok();
  });

  await h(t).withLog("And hide sender's name", async (step) => {
    await t.expect(viewerDialog.senderName.visible).notOk();
  });

  await h(t).withLog("And hide send time", async () => {
    await t.expect(viewerDialog.sendTime.visible).notOk();
  });
});
