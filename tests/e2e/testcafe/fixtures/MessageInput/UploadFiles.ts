/*
 * @Author: Mia.Cai
 * @Date: 2018-12-25 10:47:13
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';

import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { IGroup, ITestMeta } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';

function fileSizeOf(filePath: string, unit: string = 'KB', num: number = 1) {
  // filePath is relative to current script (thanks to testcafe!), so we have to get absolute path before read stat
  // FIXME: we should following the display rule of Jupiter
  const stat = fs.statSync(path.join(__dirname, filePath));
  if ('KB' === unit) {
    return `${(stat.size / 1024).toFixed(num)}KB`
  }
  throw Error(`unsupported unit: ${unit}`);
}

function fileNameOf(filePath: string) {
  return path.basename(filePath);
}

fixture('UploadFiles')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


  test.meta(<ITestMeta>{
    priority: ['P0'],
    caseIds: ['JPT-448'],
    maintainers: ['Mia.Cai'],
    keywords: ['UploadFiles'],
  })('The post is sent successfully when sending a post with uploaded files', async (t) => {

  const users = h(t).rcData.mainCompany.users;
  const user = users[4];
  await h(t).platform(user).init();

  let teamId: string, teamName: string = `Team ${uuid()}`;
  await h(t).withLog(`Given I have an extension with at least one team conversation: "${teamName}"`, async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      type: 'Team',
      name: teamName,
      members: [user.rcId, users[5].rcId],
    });
  });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created team conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  const file1 = ['../../sources/1.txt'];
  const file2 = ['../../sources/3.txt'];
  const files = ['../../sources/1.txt','../../sources/3.txt'];
  const fileName1 = '1.txt';
  const fileName2 = '3.txt';

  await h(t).withLog('And upload two files as attachments', async () => {
    await conversationPage.uploadFilesToMessageAttachment(file1);
    await conversationPage.uploadFilesToMessageAttachment(file2);
  });

  await h(t).withLog('Then the file is in the the message attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName1).exists).ok();
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName1).visible).ok();
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName2).exists).ok();
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName2).visible).ok();
  });

  const message = `${uuid()} text message with attachments`;
  await h(t).withLog(`And send this message: "${message}"`, async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.lastPostItem.waitForPostToSend();
  });

  await h(t).withLog('Then I should find this message with files in post list', async () => {
    await t.expect(conversationPage.lastPostItem.text.withText(H.escapePostText(message)).exists).ok();
    await t.expect(conversationPage.lastPostItem.fileNames.count).eql(files.length);
  }, true);

  await h(t).withLog("And files' name and size in this post should be correct", async () => {
    for (const file of files) {
      await t.expect(conversationPage.lastPostItem.fileSizes.withText(fileSizeOf(file)).exists).ok();
      await t.expect(conversationPage.lastPostItem.fileNames.withText(fileNameOf(file)).exists).ok();
    }
  });

  const note = `shared ${files.length} files`;
  await h(t).withLog(`And the post's notification should display: "${note}"`, async () => {
    await t.expect(conversationPage.fileNotification.withText(note).exists).ok();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-592'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('Should not show the prompt when re-select an existing file only in attachment', async (t) => {

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  await h(t).platform(user).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];

  let teamId;
  await h(t).withLog(`Given I create one new team`, async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      type: 'Team',
      name: uuid(),
      members: [user.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog('And upload one file to the message attachment in the created conversation ', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('Then the file is in the the message attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

  await h(t).withLog('When upload the same name file to the message attachment in the created conversation ', async () => {
    await conversationPage.lastPostItem.waitForPostToSend();
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  await h(t).withLog('Then shouldn\'t show a duplicate prompt ', async () => {
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await t.expect(duplicatePromptPage.duplicateModal.exists).notOk();
  });
});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-498','JPT-457'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('JPT-498 Can cancel files in the duplicate prompt when the same name is sent;JPT-457 Will show the prompt when re-upload an existing file in the conversation', async (t) => {

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  await h(t).platform(user).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];

  let teamId;
  await h(t).withLog(`Given I create one new team`, async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      type: 'Team',
      name: uuid(),
      members: [user.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog('And upload one file to the message attachment in the created conversation ', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('Then the file is in the the message attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog('And upload the same name file to the message attachment in the created conversation ', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  // JPT-457
  await h(t).withLog('Then will show a duplicate prompt ', async () => {
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
  });

  await h(t).withLog('When click cancel button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickCancelButton();
  });

  await h(t).withLog('Then the duplicate prompt dismiss', async () => {
    await t.expect(duplicatePromptPage.duplicateCreateButton.exists).notOk();
  });

  await h(t).withLog('And the file count in the attachment should be zero', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).count).eql(0);
  });

});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-499'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('JPT-499 Can update files when click update the button in the duplicate prompt', async (t) => {
  
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  await h(t).platform(user).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];
  const files1Size = '0.4KB';
  const files2Size = '3.2KB';
  const message = uuid();
  const V2 = 'uploaded version 2';

  let teamId;
  await h(t).withLog(`Given I create one new teams`, async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      type: 'Team',
      name: uuid(),
      members: [user.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog(`And upload one file to the message attachment in the created conversation,size=${files1Size} `, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('And I can send the file to this conversation', async () => {
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog('Then I can read this message with files from post list', async () => {
    await t.expect(conversationPage.fileNamesOnPost.nth(0).withText(fileName).exists).ok();
  });

  await h(t).withLog(`And the sent files size=${files1Size} `, async () => {
    await t.expect(conversationPage.previewFilesSize.nth(0).withText(files1Size).exists).ok();
  });

  await h(t).withLog(`When upload the same name file to the conversation,size=${files2Size} `, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  await h(t).withLog('Then will show a duplicate prompt ', async () => {
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
  });

  await h(t).withLog('When click update button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickUpdateButton();
  });

  await h(t).withLog('Then the file is in the the message attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`Then the sent post\'s conversationCard shows ${V2}`, async () => {
    await t.expect(conversationPage.fileNotification.withText(V2).exists).ok();
  });

  await h(t).withLog(`And the same sent files size should be the same, and the size is ${files2Size}`, async () => {
    await t.expect(conversationPage.previewFilesSize.nth(0).withText(files2Size).exists).ok();
    await t.expect(conversationPage.previewFilesSize.nth(1).withText(files2Size).exists).ok();
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-532'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('JPT-532 Can update files when re-select the file and local exists one post with the same name file', async (t) => {

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  await h(t).platform(user).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];
  const filesPath3 = ['../../sources/files1/1.txt'];
  const filesSize = ['0.4KB', '3.2KB', '0.5KB'];
  const message = uuid();
  const V2 = 'uploaded version 2';

  let teamId;
  await h(t).withLog(`Given I create one new teams`, async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      type: 'Team',
      name: uuid(),
      members: [user.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog(`And upload one file to the message attachment in the created conversation,size=${filesSize[0]} `, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('Then the file count should be one in the attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).count).eql(1);
  });

  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`And upload the same name file to the conversation, size=${filesSize[1]}`, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  await h(t).withLog('Then will show a duplicate prompt ', async () => {
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
  });

  await h(t).withLog('When click update button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickUpdateButton();
  });

  await h(t).withLog('Then the file count should be one in the attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).count).eql(1);
  });

  await h(t).withLog(`When upload the same name file to the attachment, and size = ${filesSize[2]}`, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath3);
  });

  await h(t).withLog('Then will show a duplicate prompt ', async () => {
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
  });

  await h(t).withLog('When click update button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickUpdateButton();
  });

  await h(t).withLog('Then the file count should be one in the attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).count).eql(1);
  });

  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`Then the post\'s conversationCard header will show ${V2}`, async () => {
    await t.expect(conversationPage.fileNotification.nth(1).withText(V2).exists).ok();
  });

  await h(t).withLog(`And the sent file size should be ${filesSize[2]}`, async () => {
    await t.expect(conversationPage.previewFilesSize.nth(0).withText(filesSize[2]).exists).ok();
    await t.expect(conversationPage.previewFilesSize.nth(1).withText(filesSize[2]).exists).ok();
  });

});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-500'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('JPT-500 Can create files in the duplicate prompt when the same name file is sent', async (t) => {

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  await h(t).platform(user).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const fileName = '1.txt';
  const file1Size = '0.4KB';
  const file2Size = '3.2KB';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];
  const message = uuid();

  let teamId;
  await h(t).withLog(`Given I create one new teams`, async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      type: 'Team',
      name: uuid(),
      members: [user.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog('And upload one file to the message attachment in the created conversation ', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('And I can send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog('And upload the same name file to the conversation ', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  await h(t).withLog('Then will show a duplicate prompt ', async () => {
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
  });

  await h(t).withLog('When click Create button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickCreateButton();
  });

  await h(t).withLog('Then the file is in the the message attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`Then the previous sent file size = ${file1Size} `, async () => {
    await t.expect(conversationPage.previewFilesSize.nth(0).withText(file1Size).exists).ok();
  });

  await h(t).withLog(`And the later sent file size = ${file2Size} `, async () => {
    await t.expect(conversationPage.previewFilesSize.nth(1).withText(file2Size).exists).ok();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-533'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('JPT-533 Can create files when re-select the file and local exists one post with the same name file', async (t) => {
 
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  await h(t).platform(user).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];
  const filesPath3 = ['../../sources/files1/1.txt'];
  const filesSize = ['0.4KB', '3.2KB', '0.5KB'];
  const message = uuid();

  let teamId;
  await h(t).withLog(`Given I create one new teams`, async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      type: 'Team',
      name: uuid(),
      members: [user.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog(`And upload one file to the message attachment in the created conversation,size=${filesSize[0]}`, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('Then the file count should be one in the attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).count).eql(1);
  });

  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
  });

  await h(t).withLog(`And upload the same name file to the conversation,size=${filesSize[1]} `, async () => {
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  await h(t).withLog('Then will show a duplicate prompt ', async () => {
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
  });

  await h(t).withLog('When click Create button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickCreateButton();
  });

  await h(t).withLog('Then the file count should be one in the attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).count).eql(1);
  });

  await h(t).withLog(`When upload the same name file to the conversation,size=${filesSize[2]} `, async () => {
    await conversationPage.lastPostItem.waitForPostToSend();
    await conversationPage.uploadFilesToMessageAttachment(filesPath3);
  });

  await h(t).withLog('Then will show a duplicate prompt ', async () => {
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
  });

  await h(t).withLog('When click Create button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickCreateButton();
  });

  await h(t).withLog('Then the file count should be two in the attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).count).eql(2);
  });

  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`Then the sent files size should have ${filesSize}`, async () => {
    filesSize.forEach(async (size) => {
      await t.expect(conversationPage.previewFilesSize.withText(size).exists).ok();
    });
  });
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-593'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('JPT-593 Should update the oldest file when creating same name file then re-upload and update same name file to the conversation', async (t) => {
 
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  await h(t).platform(user).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];
  const filesPath3 = ['../../sources/files1/1.txt'];
  const filesSize = ['0.4KB', '3.2KB', '0.5KB'];
  const V2 = 'uploaded version 2';

  let teamId;
  await h(t).withLog(`Given I create one new team`, async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      type: 'Team',
      name: uuid(),
      members: [user.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog(`And upload one file to the message attachment in the created conversation whose size is ${filesSize[0]} `, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('And I send the file to this conversation', async () => {
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`And upload the same name file to the conversation whose size is ${filesSize[1]} `, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  await h(t).withLog('Then will show a duplicate prompt', async () => {
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
  });

  await h(t).withLog('When click create button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickCreateButton();
  });

  await h(t).withLog('Then the file is in the the message attachment and focus on the input area ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
    await conversationPage.shouldFocusOnMessageInputArea();
  });

  await h(t).withLog('When I send the file to this conversation', async () => {
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`And upload same name file to the message attachment in the conversation,size=${filesSize[2]} `, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath3);
  });

  await h(t).withLog('And click update button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickUpdateButton();
  });

  await h(t).withLog('Then the file is in the the message attachment and focus on the input area ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
    await conversationPage.shouldFocusOnMessageInputArea();
  });

  await h(t).withLog('When I send file to this conversation', async () => {
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`Then the post\'s conversationCard header will show ${V2}`, async () => {
    await t.expect(conversationPage.fileNotification.nth(2).withText(V2).exists).ok();
  });

  await h(t).withLog(`And the same sent files size should be the same, and the size is ${filesSize}`, async () => {
    await t.expect(conversationPage.previewFilesSize.nth(0).withText(filesSize[2]).exists).ok();
    await t.expect(conversationPage.previewFilesSize.nth(1).withText(filesSize[1]).exists).ok();
    await t.expect(conversationPage.previewFilesSize.nth(2).withText(filesSize[2]).exists).ok();
  });

});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-512'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('JPT-512 Can remove files when selected files to conversations', async (t) => {
 
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  await h(t).platform(user).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.txt'];
  const fileName = '1.txt';
  const message = uuid();

  let teamId;
  await h(t).withLog(`Given I create one new team`, async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      type: 'Team',
      name: uuid(),
      members: [user.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog('And upload one file to the message attachment in the created conversation ', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
  });

  await h(t).withLog('Then the file is in the the message attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

  await h(t).withLog('When remove the file from the conversation', async () => {
    await conversationPage.removeFileOnMessageArea();
  });

  await h(t).withLog('Then the file is removed from the conversation ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).notOk();
  });

  await h(t).withLog('When I send one message to this conversation', async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog('Then the file shouldn\'t be sent to the conversation ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).notOk();
  });
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-515'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('JPT-515 The selected files shouldn\'t be in the other conversation when switch to other conversations', async (t) => {
 
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  await h(t).platform(user).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.txt'];
  const fileName = '1.txt';

  let teamId = [];
  await h(t).withLog(`Given I create two new teams`, async () => {
    for (let i = 0; i < 2; i++) {
      teamId[i] = await h(t).platform(user).createAndGetGroupId({
        type: 'Team',
        name: uuid(),
        members: [user.rcId, users[5].rcId],
      });
    }
  });

  await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open the first conversation', async () => {
    await teamsSection.conversationEntryById(teamId[0]).enter();
  });

  await h(t).withLog('And upload one file to the message attachment in the first conversation ', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
  });

  await h(t).withLog('Then the file is in the the message attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

  await h(t).withLog('When open the second conversation', async () => {
    await teamsSection.conversationEntryById(teamId[1]).enter();
  });

  await h(t).withLog('Then the file doesn\'t show in the second conversation ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).notOk()
  });

  await h(t).withLog('When back to the first conversation', async () => {
    await teamsSection.conversationEntryById(teamId[0]).enter();
  });

  await h(t).withLog('Then upload file shows in the first conversation ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-889'],
  maintainers: ['Skye.Wang'],
  keywords: ['UploadFiles'],
})('JPT-889 Check focus on input box when remove files', async (t) => {
 
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).platform(loginUser).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const filesPath = ['../../sources/1.txt'];

  let teamId;
  await h(t).withLog('Give I create a new team', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId, users[6].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And open the first conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog('And upload one file to the message attachment', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
  });

  await h(t).withLog('When I remove one file from the message attachment', async () => {
    await conversationPage.removeFileOnMessageArea();
  });

  await h(t).withLog('Then the mouse is focus on the input area', async () => {
    await conversationPage.shouldFocusOnMessageInputArea();
  });
});

test.skip.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1438'],
  maintainers: ['Potar'],
  keywords: ['UploadFiles'],
})('Can update image size in the duplicate prompt when the same name image is sent', async (t) => {

  const loginUser = h(t).rcData.mainCompany.users[0];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  await h(t).withLog(`Given I create one new team named "${team.name}"`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const fileName = '1.jpg';
  const initWidth = 360;
  const initHeight = 240;
  // as we just get image url with arguments(1000x200) like dThor, so here are the expected size.
  const expectedWidth = 300;
  const expectedHeight = 200;
  const finalWidth = 180;
  const finalHeight = 120;
  const filesPaths = ['../../sources/files/1.jpg', '../../sources/files1/1.jpg'];
  await h(t).log(`and prepare same name "${fileName}" image files, their size: ${initWidth}x${initHeight} and ${finalWidth}x${finalHeight}`);

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog(`When I send the big size image file named: "${fileName}"`, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPaths[0]);
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await conversationPage.nthPostItem(-1).waitImageVisible(20e3);
  });

  await h(t).withLog(`Then the image file size should be ${expectedWidth}x${expectedHeight}`, async () => {
    await t.expect(conversationPage.nthPostItem(-1).img.getBoundingClientRectProperty('width')).eql(expectedWidth);
    await t.expect(conversationPage.nthPostItem(-1).img.getBoundingClientRectProperty('height')).eql(expectedHeight);
  }, true);

  await h(t).withLog(`When I upload the same name file to the conversation whose size is ${finalWidth}x${finalHeight}`, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPaths[1]);
  });

  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  await h(t).withLog('And I click "update" button in the duplicate prompt', async () => {
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
    await duplicatePromptPage.clickUpdateButton();
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await conversationPage.nthPostItem(-1).waitImageVisible(20e3);
  });

  await h(t).withLog(`Then the last image size should be ${finalWidth}x${finalHeight}`, async () => {
    await t.expect(conversationPage.nthPostItem(-1).img.getBoundingClientRectProperty('width')).eql(finalWidth);
    await t.expect(conversationPage.nthPostItem(-1).img.getBoundingClientRectProperty('height')).eql(finalHeight);
  }, true);

  await h(t).withLog(`Then the first image size should be ${finalWidth}x${finalHeight}`, async () => {
    await t.expect(conversationPage.nthPostItem(0).img.getBoundingClientRectProperty('width')).eql(finalWidth);
    await t.expect(conversationPage.nthPostItem(0).img.getBoundingClientRectProperty('height')).eql(finalHeight);
  });
});
