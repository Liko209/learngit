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
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created team conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  const file1 = ['../../sources/1.txt'];
  const file2 = ['../../sources/3.txt'];
  const files = ['../../sources/1.txt', '../../sources/3.txt'];
  const fileName1 = '1.txt';
  const fileName2 = '3.txt';

  await h(t).withLog('When I upload two files as attachments', async () => {
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
  await h(t).withLog(`And send this message: "{message}"`, async (step) => {
    step.setMetadata('message', message);
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
  await h(t).withLog(`And the post's notification should display: "{note}"`, async (step) => {
    step.setMetadata('note', note);
    await t.expect(conversationPage.fileNotification.withText(note).exists).ok();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-592'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('Should not show the prompt when re-select an existing file only in attachment', async (t) => {

  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I upload one file to the message attachment in the created conversation ', async () => {
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
  caseIds: ['JPT-498', 'JPT-457'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('JPT-498 Can cancel files in the duplicate prompt when the same name is sent;JPT-457 Will show the prompt when re-upload an existing file in the conversation', async (t) => {

  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I upload one file to the message attachment in the created conversation ', async () => {
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

  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];
  const files1Size = '0.4KB';
  const files2Size = '3.2KB';
  const message = uuid();
  const V2 = 'uploaded version 2';

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog(`When I upload one file to the message attachment in the created conversation,size={files1Size}`, async (step) => {
    step.setMetadata('files1Size', files1Size);
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('And I can send the file to this conversation', async () => {
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog('Then I can read this message with files from post list', async () => {
    await t.expect(conversationPage.fileNamesOnPost.nth(0).withText(fileName).exists).ok();
  });

  await h(t).withLog(`And the sent files size={files1Size}`, async (step) => {
    step.setMetadata('files1Size', files1Size);
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

  await h(t).withLog(`Then the sent post\'s conversationCard shows {V2}`, async (step) => {
    step.setMetadata('V2', V2);
    await t.expect(conversationPage.fileNotification.withText(V2).exists).ok();
  });

  await h(t).withLog(`And the same sent files size should be the same, and the size is {files2Size}`, async (step) => {
    step.setMetadata('files2Size', files2Size);
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

  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];
  const filesPath3 = ['../../sources/files1/1.txt'];
  const filesSize = ['0.4KB', '3.2KB', '0.5KB'];
  const message = uuid();
  const V2 = 'uploaded version 2';

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog(`When I upload one file to the message attachment in the created conversation,size={filesSize} `, async (step) => {
    step.setMetadata('filesSize', filesSize[0]);
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('Then the file count should be one in the attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).count).eql(1);
  });

  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`And upload the same name file to the conversation, size={filesSize}`, async (step) => {
    step.setMetadata('filesSize', filesSize[1]);
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

  await h(t).withLog(`When upload the same name file to the attachment, and size = {filesSize}`, async (step) => {
    step.setMetadata('filesSize', filesSize[2]);
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

  await h(t).withLog(`Then the post\'s conversationCard header will show {V2}`, async (step) => {
    step.setMetadata('V2', V2);
    await t.expect(conversationPage.fileNotification.nth(1).withText(V2).exists).ok();
  });

  await h(t).withLog(`And the sent file size should be {filesSize}`, async (step) => {
    step.setMetadata('filesSize', filesSize[2]);
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

  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  const fileName = '1.txt';
  const file1Size = '0.4KB';
  const file2Size = '3.2KB';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];
  const message = uuid();

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I upload one file to the message attachment in the created conversation ', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('And I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog('And I upload the same name file to the conversation ', async () => {
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

  await h(t).withLog(`Then the previous sent file size = {file1Size} `, async (step) => {
    step.setMetadata('file1Size', file1Size);
    await t.expect(conversationPage.previewFilesSize.nth(0).withText(file1Size).exists).ok();
  });

  await h(t).withLog(`And the later sent file size = {file2Size} `, async (step) => {
    step.setMetadata('file2Size', file2Size);
    await t.expect(conversationPage.previewFilesSize.nth(1).withText(file2Size).exists).ok();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-533'],
  maintainers: ['Mia.Cai'],
  keywords: ['UploadFiles'],
})('JPT-533 Can create files when re-select the file and local exists one post with the same name file', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];
  const filesPath3 = ['../../sources/files1/1.txt'];
  const filesSize = ['0.4KB', '3.2KB', '0.5KB'];
  const message = uuid();

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog(`When I upload one file to the message attachment in the created conversation,size={filesSize}`, async (step) => {
    step.setMetadata('filesSize', filesSize[0]);
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('Then the file count should be one in the attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).count).eql(1);
  });

  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
  });

  await h(t).withLog(`And upload the same name file to the conversation,size={filesSize} `, async (step) => {
    step.setMetadata('filesSize', filesSize[1]);
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

  await h(t).withLog(`When upload the same name file to the conversation,size={filesSize} `, async (step) => {
    step.setMetadata('filesSize', filesSize[2]);
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

  await h(t).withLog(`Then the sent files size should have {filesSize}`, async (step) => {
    step.setMetadata('filesSize', filesSize.toString());
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

  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();

  const fileName = '1.txt';
  const filesPath1 = ['../../sources/1.txt'];
  const filesPath2 = ['../../sources/files/1.txt'];
  const filesPath3 = ['../../sources/files1/1.txt'];
  const filesSize = ['0.4KB', '3.2KB', '0.5KB'];
  const V2 = 'uploaded version 2';


  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog(`When I upload one file to the message attachment in the created conversation whose size is {filesSize} `, async (step) => {
    step.setMetadata('filesSize', filesSize[0]);
    await conversationPage.uploadFilesToMessageAttachment(filesPath1);
  });

  await h(t).withLog('And I send the file to this conversation', async () => {
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`And upload the same name file to the conversation whose size is {filesSize} `, async (step) => {
    step.setMetadata('filesSize', filesSize[1]);
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

  await h(t).withLog(`And upload same name file to the message attachment in the conversation,size={filesSize} `, async (step) => {
    step.setMetadata('filesSize', filesSize[2]);
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

  await h(t).withLog(`Then the post\'s conversationCard header will show {V2}`, async (step) => {
    step.setMetadata('V2', V2);
    await t.expect(conversationPage.fileNotification.nth(2).withText(V2).exists).ok();
  });

  await h(t).withLog(`And the same sent files size should be the same, and the size is {filesSize}`, async (step) => {
    step.setMetadata('filesSize', filesSize.toString());
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

  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();

  const filesPath = ['../../sources/1.txt'];
  const fileName = '1.txt';
  const message = uuid();

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I upload one file to the message attachment in the created conversation ', async () => {
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

  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();

  const filesPath = ['../../sources/1.txt'];
  const fileName = '1.txt';

  const team1 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  const team2 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 2 teams', async () => {
    await h(t).scenarioHelper.createTeams([team1, team2]);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the first conversation', async () => {
    await teamsSection.conversationEntryById(team1.glipId).enter();
  });

  await h(t).withLog('When I upload one file to the message attachment in the first conversation ', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
  });

  await h(t).withLog('Then the file is in the the message attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

  await h(t).withLog('When open the second conversation', async () => {
    await teamsSection.conversationEntryById(team2.glipId).enter();
  });

  await h(t).withLog('Then the file doesn\'t show in the second conversation ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).notOk()
  });

  await h(t).withLog('When back to the first conversation', async () => {
    await teamsSection.conversationEntryById(team1.glipId).enter();
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

  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  const filesPath = ['../../sources/1.txt'];

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the first conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I upload one file to the message attachment', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
  });

  await h(t).withLog('And I remove one file from the message attachment', async () => {
    await conversationPage.removeFileOnMessageArea();
  });

  await h(t).withLog('Then the mouse is focus on the input area', async () => {
    await conversationPage.shouldFocusOnMessageInputArea();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-959'],
  maintainers: ['Potar.He'],
  keywords: ['UploadFiles'],
})('Check can focus on input box when create/update files', async (t) => {

  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];

  const filePathViaApi = './sources/1.txt';
  const filePath = '../../sources/1.txt';
  const fileName = '1.txt';

  let team = <IGroup>{
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
    name: uuid()
  }

  await h(t).withLog('Give I create a new team: {name}', async (step) => {
    step.setMetadata('name', team.name)
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('And I send 2 files in the team via Api', async () => {
    await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths: filePathViaApi,
      group: team,
      operator: loginUser,
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

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the team ', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I upload one exist name file to the message attachment', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filePath);
  });

  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;

  await h(t).withLog('And I click "update" button in the duplicate prompt', async () => {
    await duplicatePromptPage.ensureLoaded();
    await duplicatePromptPage.clickUpdateButton();
  })

  await h(t).withLog('Then the mouse is focus on the input area', async () => {
    await conversationPage.shouldFocusOnMessageInputArea();
  });

  await h(t).withLog('And The file display in the attachment area', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

  await h(t).withLog('When I remove one file from the message attachment', async () => {
    await conversationPage.removeFileOnMessageArea();
  });

  await h(t).withLog('Then the file dismiss in the attachment area', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).notOk();
  });

  await h(t).withLog('When I upload one exist name file to the message attachment', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filePath);
  });

  await h(t).withLog('And I click "create" button in the duplicate prompt', async () => {
    await duplicatePromptPage.ensureLoaded();
    await duplicatePromptPage.clickCreateButton();
  })

  await h(t).withLog('Then the mouse is focus on the input area', async () => {
    await conversationPage.shouldFocusOnMessageInputArea();
  });

  await h(t).withLog('And The file display in the attachment area', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

  await h(t).withLog('When I remove one file from the message attachment', async () => {
    await conversationPage.removeFileOnMessageArea();
  });

  await h(t).withLog('Then the file dismiss in the attachment area', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).notOk();
  });
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1438'],
  maintainers: ['Potar.He'],
  keywords: ['UploadFiles'],
})('Can update image size in the duplicate prompt when the same name image is sent', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  const filesPaths = ['../../sources/files/xy.jpg', '../../sources/files1/xy.jpg'];
  const filename = 'xy'
  const x = 180;
  const y = 240;

  await h(t).withLog(`Given I prepare 2 same name {filename} image files size: {x}*{y}, {y}*{x}`, async (step) => {
    step.initMetadata({
      filename,
      x: x.toString(),
      y: y.toString()
    })
  });

  await h(t).withLog(`And I create one new team named "{teamName}"`, async (step) => {
    step.setMetadata('teamName', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open the created conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog(`When I send the big size image file named: "{filename}"`, async (step) => {
    step.setMetadata("filename", filename);
    await conversationPage.uploadFilesToMessageAttachment(filesPaths[0]);
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await conversationPage.nthPostItem(-1).waitImageVisible(20e3);
  });

  await h(t).withLog(`Then the image file size should be {x}x{y}`, async (step) => {
    step.initMetadata({
      x: x.toString(),
      y: y.toString()
    });
    await t.expect(conversationPage.nthPostItem(-1).images.getBoundingClientRectProperty('width')).eql(x);
    await t.expect(conversationPage.nthPostItem(-1).images.getBoundingClientRectProperty('height')).eql(y);
  }, true);

  await h(t).withLog(`When I upload the same name file to the conversation whose size is {y}x{x}`, async (step) => {
    step.initMetadata({
      x: x.toString(),
      y: y.toString()
    });
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

  await h(t).withLog(`Then the last image size should be {y}x{x}`, async (step) => {
    step.initMetadata({
      x: x.toString(),
      y: y.toString()
    });
    await t.expect(conversationPage.nthPostItem(-1).images.getBoundingClientRectProperty('width')).eql(y);
    await t.expect(conversationPage.nthPostItem(-1).images.getBoundingClientRectProperty('height')).eql(x);
  }, true);

  await h(t).withLog(`Then the first image size should be {y}x{x}`, async (step) => {
    step.initMetadata({
      x: x.toString(),
      y: y.toString()
    });
    await t.expect(conversationPage.nthPostItem(0).images.getBoundingClientRectProperty('width')).eql(y);
    await t.expect(conversationPage.nthPostItem(0).images.getBoundingClientRectProperty('height')).eql(x);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2899', 'JPT-2898'],
  maintainers: ['Alessia.Li'],
  keywords: ['UploadFiles'],
})('Check the "Post" button is disappear after user remove the attached files; Can send the uploaded files by clicking "Post" button', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with 1 team', async () => {
    await h(t).scenarioHelper.createTeam(team);
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

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const messageInputArea = conversationPage.messageInputArea;
  await h(t).withLog('And open the created team conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  const file1 = ['../../sources/1.txt'];
  const file2 = ['../../sources/3.txt'];
  const files = ['../../sources/1.txt', '../../sources/3.txt'];
  const fileName1 = '1.txt';
  const fileName2 = '3.txt';

  await h(t).withLog('When I upload one file as attachment', async () => {
    await conversationPage.uploadFilesToMessageAttachment(file1);
  });

  await h(t).withLog('Then the file is in the the message attachment area', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName1).exists).ok();
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName1).visible).ok();
  });

  await h(t).withLog('And the "Post" button is displayed', async () => {
    await t.expect(conversationPage.postButton.exists).ok();
  });

  await h(t).withLog('When remove the file from the conversation', async () => {
    await conversationPage.removeFileOnMessageArea();
  });

  await h(t).withLog('Then the file is removed from the message attachment area', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName1).exists).notOk();
  });

  await h(t).withLog('And the "Post" button disappeared', async () => {
    await t.expect(conversationPage.postButton.exists).notOk();
  });

  await h(t).withLog('When I upload two files as attachments', async () => {
    await conversationPage.uploadFilesToMessageAttachment(file1);
    await conversationPage.uploadFilesToMessageAttachment(file2);
  });

  await h(t).withLog('Then the file is in the the message attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName1).exists).ok();
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName1).visible).ok();
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName2).exists).ok();
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName2).visible).ok();
  });

  await h(t).withLog('And the "Post" button is displayed', async () => {
    await t.expect(conversationPage.postButton.exists).ok();
  });

  const message = `${uuid()} text message with attachments`;
  await h(t).withLog(`When I send this message: "{message}" by clicking "Post" button`, async (step) => {
    step.setMetadata('message', message);
    await t.click(messageInputArea).typeText(messageInputArea, message);
    await conversationPage.clickPostButton();
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
  await h(t).withLog(`And the post's notification should display: "{note}"`, async (step) => {
    step.setMetadata('note', note);
    await t.expect(conversationPage.fileNotification.withText(note).exists).ok();
  });
})
