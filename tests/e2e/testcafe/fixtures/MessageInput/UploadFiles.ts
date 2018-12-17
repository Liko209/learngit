/*
 * @Author: Mia.Cai
 * @Date: 2018-12-17 20:48:07
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('UploadFiles')
    .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
    .afterEach(teardownCase());


test(formalName('JPT-448 The post is sent successfully when sending a post with uploaded files',['P0', 'UploadFiles', 'Mia.Cai', 'JPT-448']), async t => {
        const app = new AppRoot(t);
        const users = h(t).rcData.mainCompany.users;
        const user = users[0];
        user.sdk = await h(t).getSdk(user);
        const teamsSection = app.homePage.messageTab.teamsSection;
        const conversationPage = app.homePage.messageTab.conversationPage;
        const filesNames = ['1.txt', '3.txt',];
        const filesPath = ['../../sources/1.txt', '../../sources/3.txt'];
        const message = uuid();

        let teamId;
        await h(t).withLog(`Given I create one new teams`, async () => {
            teamId = (await user.sdk.platform.createGroup({
                type: 'Team',
                name: uuid(),
                members: [user.rcId, users[5].rcId],
            })).data.id;
        });

        await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
            await h(t).directLoginWithUser(SITE_URL, user);
            await app.homePage.ensureLoaded();
        });

        await h(t).withLog('And open the created conversation', async () => {
           await teamsSection.conversationEntryById(teamId);
        });

        await h(t).withLog('And upload one file to the message input area of the created conversation ', async () => {
            await conversationPage.uploadFilesToMessageFilesArea(filesPath);
        });

        await h(t).withLog('Then I can send message to this conversation', async () => {
            await conversationPage.sendMessage(message);
        });

        await h(t).withLog('And I can read this message with files from post list', async () => {
            await t.expect(conversationPage.nthPostItem(-1).body.withText(message).exists).ok();
            for (let i = 0; i < filesNames.length; i++) {
              const fileName = filesNames[i];
              await t.expect(conversationPage.fileName.nth(i).withText(fileName).exists).ok();
            }
        }, true);

    });


test(formalName(
    'JPT-457 Will show the prompt when re-upload an existing file in the conversation;JPT-498 Can cancel when clicking cancel button in the duplicate prompt',
    ['P1', 'UploadFiles', 'Mia.Cai', 'JPT-457', 'JPT-498']), async t => {
      const app = new AppRoot(t);
      const users = h(t).rcData.mainCompany.users;
      const user = users[0];
      user.sdk = await h(t).getSdk(user);
      const teamsSection = app.homePage.messageTab.teamsSection;
      const conversationPage = app.homePage.messageTab.conversationPage;
      const fileName = '1.txt';
      const filesPath1 = ['../../sources/1.txt'];
      const filesPath2 = ['../../sources/files/1.txt'];
      const message = uuid();

      let teamId;
      await h(t).withLog(`Given I create one new teams`, async () => {
          teamId = (await user.sdk.platform.createGroup({
              type: 'Team',
              name: uuid(),
              members: [user.rcId, users[5].rcId],
          })).data.id;
      });

      await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
          await h(t).directLoginWithUser(SITE_URL, user);
          await app.homePage.ensureLoaded();
      });

      await h(t).withLog('And open the created conversation', async () => {
         await teamsSection.conversationEntryById(teamId);
      });

      await h(t).withLog('And upload one file to the message input area of the created conversation ', async () => {
          await conversationPage.uploadFilesToMessageFilesArea(filesPath1);
      });

      await h(t).withLog('Then I can send message to this conversation', async () => {
          await conversationPage.sendMessage(message);
      });

      await h(t).withLog('And upload the file again ', async () => {
        await conversationPage.uploadFilesToMessageFilesArea(filesPath2);
     });

      await h(t).withLog('Then will show a duplicate prompt ', async () => {
          await t.expect(conversationPage.duplicateModal.exists).ok();
      });

      await h(t).withLog('When click cancel button in the duplicate prompt', async () => {
        await conversationPage.clickCancelButton();
      });

      await h(t).withLog('Then the duplicate prompt dismiss', async () => {
        await t.expect(conversationPage.duplicateCreateButton.exists).notOk();
      });

      await h(t).withLog('Then the file isn\'t in the the message input area ', async () => {
        await t.expect(conversationPage.attachmentFileName.withText(fileName).exists).notOk();
      });

    });

    // TODO
test.only(formalName('JPT-499 Can update files when click update the button in the duplicate prompt',['P1', 'UploadFiles', 'Mia.Cai', 'JPT-499']), async t => {
      const app = new AppRoot(t);
      const users = h(t).rcData.mainCompany.users;
      const user = users[0];
      user.sdk = await h(t).getSdk(user);
      const teamsSection = app.homePage.messageTab.teamsSection;
      const conversationPage = app.homePage.messageTab.conversationPage;
      const filesPath1 = ['../../sources/1.txt'];
      const filesPath2 = ['../../sources/files/1.txt'];
      const file1Size = '0.4Kb';
      const file2Size = '3.2Kb';
      const message = '';
      const V2 = 'uploaded version 2';

      let teamId;
      await h(t).withLog(`Given I create one new teams`, async () => {
          teamId = (await user.sdk.platform.createGroup({
              type: 'Team',
              name: uuid(),
              members: [user.rcId, users[5].rcId],
          })).data.id;
      });

      await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
          await h(t).directLoginWithUser(SITE_URL, user);
          await app.homePage.ensureLoaded();
          await t.wait(5e4);
      });

      await h(t).withLog('And open the created conversation', async () => {
         await teamsSection.conversationEntryById(teamId);
      });

      await h(t).withLog('And upload one file to the message input area of the created conversation ', async () => {
          await conversationPage.uploadFilesToMessageFilesArea(filesPath1);
      });

      await h(t).withLog('Then I can send message to this conversation', async () => {
          await conversationPage.sendMessage(message);
      });

      await h(t).withLog('And upload the file again ', async () => {
        await conversationPage.uploadFilesToMessageFilesArea(filesPath2);
     });

      await h(t).withLog('Then will show a duplicate prompt ', async () => {
          await t.expect(conversationPage.duplicateModal.exists).ok();
      });

      await h(t).withLog('When click update button in the duplicate prompt', async () => {
        await conversationPage.clickUpdateButton();
      });

      await h(t).withLog('Then I can send message to this conversation', async () => {
        await conversationPage.sendMessage(message);
    });

      // TODO
    //   await h(t).withLog('Then updated to version2', async () => {
    //     t.expect(conversationPage.conversationCard.withText(V2).exists).ok();
    //   });

      await h(t).withLog(`And the previous sent file size = ${file2Size} `, async () => {
        await t.expect(conversationPage.previewFileSize.nth(0).withText(file2Size).exists).ok();
      });

      await h(t).withLog(`And the later sent file size = ${file2Size} `, async () => {
        await t.expect(conversationPage.previewFileSize.nth(1).withText(file2Size).exists).ok();
      });

    });

test.only(formalName('JPT-500 Can create files when click create button in the duplicate prompt',['P1', 'UploadFiles', 'Mia.Cai', 'JPT-500']), async t => {
      const app = new AppRoot(t);
      const users = h(t).rcData.mainCompany.users;
      const user = users[0];
      user.sdk = await h(t).getSdk(user);
      const teamsSection = app.homePage.messageTab.teamsSection;
      const conversationPage = app.homePage.messageTab.conversationPage;
      const file1Size = '0.4Kb';
      const file2Size = '3.2Kb';
      const filesPath1 = ['../../sources/1.txt'];
      const filesPath2 = ['../../sources/files/1.txt'];
      const message = '';

      let teamId;
      await h(t).withLog(`Given I create one new teams`, async () => {
          teamId = (await user.sdk.platform.createGroup({
              type: 'Team',
              name: uuid(),
              members: [user.rcId, users[5].rcId],
          })).data.id;
      });

      await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
          await h(t).directLoginWithUser(SITE_URL, user);
          await app.homePage.ensureLoaded();
      });

      await h(t).withLog('And open the created conversation', async () => {
         await teamsSection.conversationEntryById(teamId);
      });

      await h(t).withLog('And upload one file to the message input area of the created conversation ', async () => {
          await conversationPage.uploadFilesToMessageFilesArea(filesPath1);
      });

      await h(t).withLog('Then I can send message to this conversation', async () => {
          await conversationPage.sendMessage(message);
      });

      await h(t).withLog('And upload the file again ', async () => {
        await conversationPage.uploadFilesToMessageFilesArea(filesPath2);
     });

      await h(t).withLog('Then will show a duplicate prompt ', async () => {
          await t.expect(conversationPage.duplicateModal.exists).ok();
      });

      await h(t).withLog('When click create button in the duplicate prompt', async () => {
        await conversationPage.clickCreateButton();
      });

      await h(t).withLog('Then I can send message to this conversation', async () => {
        await conversationPage.sendMessage(message);
     });

      //  todo
      await h(t).withLog(`And the previous sent file size = ${file1Size} `, async () => {
        await t.expect(conversationPage.previewFileSize.nth(0).withText(file1Size).exists).ok();
      });

      await h(t).withLog(`And the later sent file size = ${file2Size} `, async () => {
        await t.expect(conversationPage.previewFileSize.nth(1).withText(file2Size).exists).ok();
      });

    });


    test(formalName('JPT-512 Can remove files when selected files to conversations',['P1', 'UploadFiles', 'Mia.Cai', 'JPT-512']), async t => {

        const app = new AppRoot(t);
        const users = h(t).rcData.mainCompany.users;
        const user = users[0];
        user.sdk = await h(t).getSdk(user);
        const teamsSection = app.homePage.messageTab.teamsSection;
        const conversationPage = app.homePage.messageTab.conversationPage;
        const filesPath = ['../../sources/1.txt'];
        const fileName = '1.txt';

        let teamId;
        await h(t).withLog(`Given I create one new teams`, async () => {
            teamId = (await user.sdk.platform.createGroup({
                type: 'Team',
                name: uuid(),
                members: [user.rcId, users[5].rcId],
            })).data.id;
        });

        await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
            await h(t).directLoginWithUser(SITE_URL, user);
            await app.homePage.ensureLoaded();
        });

        await h(t).withLog('And open the created conversation', async () => {
           await teamsSection.conversationEntryById(teamId);
        });

        await h(t).withLog('And upload one file to the message input area of the created conversation ', async () => {
            await conversationPage.uploadFilesToMessageFilesArea(filesPath);
        });

        await h(t).withLog('Then the file is in the the message input area ', async () => {
          await t.expect(conversationPage.attachmentFileName.withText(fileName)).ok();
        });

        await h(t).withLog('And remove the file from the conversation', async () => {
            await conversationPage.clickRemoveButton();
        });

        await h(t).withLog('Then the file is removed from the conversation ', async () => {
          await t.expect(conversationPage.attachmentFileName.withText(fileName).exists).notOk();
        });

      });
