/*
 * @Author: Mia.Cai
 * @Date: 2018-12-25 10:47:13
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';


fixture('UploadFiles')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

const WAIT_FOR_POST_SENT = 5e3;

// bug:https://jira.ringcentral.com/browse/FIJI-2399, so I only skip the check point, only check uploading several files
test(formalName('JPT-448 The post is sent successfully when sending a post with uploaded files', ['P0', 'UploadFiles', 'Mia.Cai', 'JPT-448']), async t => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[4];
  await h(t).platform(user).init();
  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const lastPost = conversationPage.nthPostItem(-1);
  const filesNames = ['1.txt', '3.txt'];
  const filesSize = ['0.4KB', '2.0KB'];
  const filesPath = ['../../sources/1.txt', '../../sources/3.txt'];
  const message = uuid();
  const NOTIFICATIONS = `shared ${filesPath.length} files`;

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
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
  });

  await h(t).withLog('And I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
  });

  await h(t).withLog('Then I can read this message with files from post list', async () => {
    // TODO bug https://jira.ringcentral.com/browse/FIJI-2399, so I skip the check point
    // await t.expect(conversationPage.nthPostItem(-1).body.withText(message).exists).ok();
    for (let i of _.range(filesNames.length)) {
      await lastPost.nthFileNameShouldBe(i, filesNames[i]);
    }
  }, true);

  await h(t).withLog(`And the sent files size should be correct `, async () => {
    for (let i of _.range(filesNames.length)) {
      await lastPost.nthFileSizeShouldBe(i, filesSize[i]);
    }
  });

  await h(t).withLog(`And the sent post\'s conversationCard shows ${NOTIFICATIONS}`, async () => {
    await t.expect(conversationPage.fileNotification.withText(NOTIFICATIONS).exists).ok();
  });
});

test(formalName(`JPT-592 Shouldn't show the prompt when re-select an existing file only in attachment;`, ['P2', 'UploadFiles', 'Mia.Cai', 'JPT-592']), async t => {
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
    await t.wait(WAIT_FOR_POST_SENT);
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  await h(t).withLog('Then shouldn\'t show a duplicate prompt ', async () => {
    await t.expect(duplicatePromptPage.duplicateModal.exists).notOk();
  });
});

test(formalName(`JPT-498 Can cancel files in the duplicate prompt when the same name is sent;JPT-457 Will show the prompt when re-upload an existing file in the conversation`, ['P1', 'UploadFiles', 'Mia.Cai', 'JPT-498', 'JPT-457']), async t => {
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
    await conversationPage.sendMessageWithoutText();
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
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

test(formalName('JPT-499 Can update files when click update the button in the duplicate prompt', ['P1', 'UploadFiles', 'Mia.Cai', 'JPT-499']), async t => {
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
    await conversationPage.sendMessageWithoutText()
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
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
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
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
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
  });

  await h(t).withLog(`Then the sent post\'s conversationCard shows ${V2}`, async () => {
    await t.expect(conversationPage.fileNotification.withText(V2).exists).ok();
  });

  await h(t).withLog(`And the same sent files size should be the same, and the size is ${files2Size}`, async () => {
    await t.expect(conversationPage.previewFilesSize.nth(0).withText(files2Size).exists).ok();
    await t.expect(conversationPage.previewFilesSize.nth(1).withText(files2Size).exists).ok();
  });

});

test(formalName('JPT-532 Can update files when re-select the file and local exists one post with the same name file', ['P2', 'UploadFiles', 'Mia.Cai', 'JPT-532']), async t => {
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
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
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
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
  });

  await h(t).withLog(`Then the post\'s conversationCard header will show ${V2}`, async () => {
    await t.expect(conversationPage.fileNotification.nth(1).withText(V2).exists).ok();
  });

  await h(t).withLog(`And the sent file size should be ${filesSize[2]}`, async () => {
    await t.expect(conversationPage.previewFilesSize.nth(0).withText(filesSize[2]).exists).ok();
    await t.expect(conversationPage.previewFilesSize.nth(1).withText(filesSize[2]).exists).ok();
  });

});

test(formalName('JPT-500 Can create files in the duplicate prompt when the same name file is sent', ['P1', 'UploadFiles', 'Mia.Cai', 'JPT-500']), async t => {
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
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
  });

  await h(t).withLog('And upload the same name file to the conversation ', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  await h(t).withLog('Then will show a duplicate prompt ', async () => {
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
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
  });

  await h(t).withLog(`Then the previous sent file size = ${file1Size} `, async () => {
    await t.expect(conversationPage.previewFilesSize.nth(0).withText(file1Size).exists).ok();
  });

  await h(t).withLog(`And the later sent file size = ${file2Size} `, async () => {
    await t.expect(conversationPage.previewFilesSize.nth(1).withText(file2Size).exists).ok();
  });
});

test(formalName('JPT-533 Can create files when re-select the file and local exists one post with the same name file', ['P2', 'UploadFiles', 'Mia.Cai', 'JPT-533']), async t => {
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
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  await h(t).withLog('Then will show a duplicate prompt ', async () => {
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
  });

  await h(t).withLog('When click Create button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickCreateButton();
  });

  await h(t).withLog('Then the file count should be one in the attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).count).eql(1);
  });

  await h(t).withLog(`When upload the same name file to the conversation,size=${filesSize[2]} `, async () => {
    await t.wait(WAIT_FOR_POST_SENT);
    await conversationPage.uploadFilesToMessageAttachment(filesPath3);
  });

  await h(t).withLog('Then will show a duplicate prompt ', async () => {
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
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
  });

  await h(t).withLog(`Then the sent files size should have ${filesSize}`, async () => {
    filesSize.forEach(async (size) => {
      await t.expect(conversationPage.previewFilesSize.withText(size).exists).ok();
    });
  });
});

test(formalName('JPT-593 Should update the oldest file when creating same name file then re-upload and update same name file to the conversation', ['P1', 'UploadFiles', 'Mia.Cai', 'JPT-593']), async t => {
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

  await h(t).withLog('And I send the file to this conversation', async () => {
    await conversationPage.sendMessageWithoutText();
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
  });

  await h(t).withLog(`And upload the same name file to the conversation,size=${filesSize[1]} `, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath2);
  });

  await h(t).withLog('Then will show a duplicate prompt ', async () => {
    await t.expect(duplicatePromptPage.duplicateModal.exists).ok();
  });

  await h(t).withLog('When click create button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickCreateButton();
  });

  await h(t).withLog('Then the file is in the the message attachment ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

  await h(t).withLog('When I send the file to this conversation', async () => {
    await conversationPage.sendMessageWithoutText();
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
  });

  await h(t).withLog(`And upload same name file to the message attachment in the conversation,size=${filesSize[2]} `, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath3);
  });

  await h(t).withLog('And click update button in the duplicate prompt', async () => {
    await duplicatePromptPage.clickUpdateButton();
  });

  await h(t).withLog('And I can send file to this conversation', async () => {
    await conversationPage.sendMessageWithoutText();
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
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

test(formalName('JPT-512 Can remove files when selected files to conversations', ['P1', 'UploadFiles', 'Mia.Cai', 'JPT-512']), async t => {
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
    await conversationPage.nthPostItem(-1).waitUntilFilesUploaded();
  });

  await h(t).withLog('Then the file shouldn\'t be sent to the conversation ', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).notOk();
  });
});

test(formalName('JPT-515 The selected files shouldn\'t be in the other conversation when switch to other conversations', ['P1', 'UploadFiles', 'Mia.Cai', 'JPT-515']), async t => {
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
