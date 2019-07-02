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

fixture('ContentPanel/DeleteImageFile')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2030'],
  maintainers: ['Wayne.Zhou'],
  keywords: ['ContentPanel/DeleteImageFile']
})(`Can delete one file/image from conversations/viewer/right self`, async (t) => {
  const deleteFileMenuItem = 'Delete file';
  let filename = '1';
  const filesPath = ['../../sources/1.docx'];
  const imagePath = '../../sources/1.png';
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

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const moreActionOnFile = app.homePage.moreActionOnFile;
  const confirmDeleteDialog = moreActionOnFile.confirmDeleteDialog;
  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open the team and upload a file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  let filesTabItem = rightRail.filesTab.nthItem(0);
  let postItem = app.homePage.messageTab.conversationPage.nthPostItem(-1);

  await h(t).withLog(`When I click the more button of the file(Entry1: conversation history)`, async() => {
    await moreActionOnFile.clickMore();
  });

  await h(t).withLog(`Then will show ${deleteFileMenuItem}`, async() => {
    await t.expect(moreActionOnFile.deleteFileMenu).ok();
  });

  await h(t).withLog(`When I click the ${deleteFileMenuItem} of the file`, async() => {
    await moreActionOnFile.clickDeleteFile();
  });

  await h(t).withLog(`Then will show confirm delete dialog`, async() => {
    await confirmDeleteDialog.ensureLoaded();
  });

  await h(t).withLog(`And I click the Cancel button`, async() => {
    await confirmDeleteDialog.clickCancelButton();
  });

  await h(t).withLog(`Then the dialog should be closed`, async() => {
    await confirmDeleteDialog.ensureDismiss();
  });

  await h(t).withLog(`And the file should remain`, async() => {
    await t.expect(postItem.exists).ok();
  });

  await h(t).withLog(`When I click Files Tab on the right self(Entry2:right self)`, async () => {
    await rightRail.filesEntry.enter();
    await rightRail.filesEntry.shouldBeOpened();
  });

  await h(t).withLog(`And I hover the file item`, async () => {
    await filesTabItem.nameShouldBe(filename);
    await t.hover(filesTabItem.self)
  });

  await h(t).withLog(`And I click the more button of the file on the right rail`, async() => {
    await filesTabItem.clickMore();
  });

  await h(t).withLog(`Then delete file menu item should be on the file action menu`, async() => {
    await t.expect(moreActionOnFile.deleteFileMenu).ok();
  });

  await h(t).withLog(`When I click the ${deleteFileMenuItem} of the file`, async() => {
    await moreActionOnFile.clickDeleteFile();
  });

  await h(t).withLog(`Then will show confirm delete dialog`, async() => {
    await confirmDeleteDialog.ensureLoaded();
  });

  await h(t).withLog('When I click delete', async() => {
    await confirmDeleteDialog.clickDeleteButton();
  })

  await h(t).withLog('Then the file should be delete', async() => {
    await t.expect(rightRail.filesTab.nthItem(0).exists).notOk();
  })

  const messageText = `anotherMessage${message}`
  await h(t).withLog('When I upload another image', async () => {
    await conversationPage.uploadFilesToMessageAttachment(imagePath);
    await conversationPage.sendMessage(messageText);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  postItem = app.homePage.messageTab.conversationPage.nthPostItem(-1);
  const viewerDialog = app.homePage.viewerDialog;
  await h(t).withLog('When I open image viewer (Entry3:file viewer)', async () => {
        await t.click(postItem.img);
        await viewerDialog.ensureLoaded();
  })

  const moreActionOnViewer = app.homePage.moreActionOnViewer;
  await h(t).withLog('And I delete this image', async () => {
    await moreActionOnViewer.ensureLoaded();
    await moreActionOnViewer.clickMore();
    await moreActionOnViewer.clickDeleteFile();
    await confirmDeleteDialog.ensureLoaded();
    await confirmDeleteDialog.clickDeleteButton();
  })

  await h(t).withLog('Then viewer should be closed and the image should be deleted', async () => {
    await t.expect(viewerDialog.exists).notOk();
    await t.expect(postItem.img.exists).notOk();
  })
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2027'],
  maintainers: ['Wayne.Zhou'],
  keywords: ['ContentPanel/DeleteImageFile']
})(`Check the Delete menu status for the sender/other members`, async (t) => {
  const deleteFileMenuItem = 'Delete file';
  let filename = '1';
  const imagePath = ['../../sources/1.png'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[3];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser,otherUser]
  }
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const moreActionOnFile = app.homePage.moreActionOnFile;
  const confirmDeleteDialog = moreActionOnFile.confirmDeleteDialog;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open the team and upload a image', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(imagePath);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`Given I logout and login Jupiter with another user ${otherUser.company.number}#${otherUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, otherUser);
  });

  await h(t).withLog('When I open the team', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog(`When I hover click the more button of the file(Entry1: conversation history)`, async() => {
    await t.hover(conversationPage.nthPostItem(-1).img)
    await moreActionOnFile.clickMore();
  });

  await h(t).withLog(`Then will show ${deleteFileMenuItem} menu item`, async() => {
    await t.expect(moreActionOnFile.deleteFileMenu).ok();
  });

  await h(t).withLog(`When I click the ${deleteFileMenuItem} of the file`, async() => {
    await moreActionOnFile.clickDeleteFile();
  });

  await h(t).withLog(`Then will not show confirm delete dialog`, async() => {
    await t.expect(confirmDeleteDialog.exists).notOk();
  });

  const rightRail = app.homePage.messageTab.rightRail;
  let imageTabItem = rightRail.imagesTab.nthItem(0);
  await h(t).withLog(`When I open file action menu on the right self(Entry2:right self)`, async () => {
    await rightRail.imagesEntry.enter();
    await rightRail.imagesEntry.shouldBeOpened();
    await imageTabItem.nameShouldBe(filename);
    await t.hover(imageTabItem.self)
    await imageTabItem.clickMore();
  });

  await h(t).withLog(`Then delete file menu item should be on the file action menu`, async() => {
    await t.expect(moreActionOnFile.deleteFileMenu).ok();
  });

  await h(t).withLog(`When I click the ${deleteFileMenuItem} of the file`, async() => {
    await moreActionOnFile.clickDeleteFile();
  });

  await h(t).withLog(`Then will not show confirm delete dialog`, async() => {
    await t.expect(confirmDeleteDialog.exists).notOk();
  })

  const postItem = conversationPage.nthPostItem(-1);
  const viewerDialog = app.homePage.viewerDialog;
  await h(t).withLog(`When I open the image in file viewer (Entry3: file viewer)`, async() => {
        await t.click(postItem.img);
        await viewerDialog.ensureLoaded();
  });

  const moreActionOnViewer = app.homePage.moreActionOnViewer;
  await h(t).withLog(`And I click the delete button of the file`, async() => {
    await moreActionOnViewer.clickMore();
    await moreActionOnViewer.clickDeleteFile();
  });

  await h(t).withLog(`Then will not show confirm delete dialog`, async() => {
    await t.expect(confirmDeleteDialog.exists).notOk();
  });

});
