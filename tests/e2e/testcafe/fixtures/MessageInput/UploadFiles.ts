/*
 * Mia.Cai (mia.cai@ringcentral.com)
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

    test.only(formalName(
    'JPT-444 Can drag/drop one or more files onto the conversation;JPT-448 The post is sent successfully when sending a post with uploaded files',
    ['P0', 'UploadFiles', 'Mia.Cai', 'JPT-444', 'JPT-448']), async t => {
        const app = new AppRoot(t);
        const users = h(t).rcData.mainCompany.users;
        const user = users[0];
        user.sdk = await h(t).getSdk(user);
        const teamsSection = app.homePage.messageTab.teamsSection;
        const conversationPage = app.homePage.messageTab.conversationPage;
        // const filesPath = ['./sources/file1.txt', './sources/file2.txt',];
        const filesPath = ['/Users/mia.cai/Fiji/tests/e2e/testcafe/sources/file1.txt'];

        const message = uuid();

        await h(t).withLog(`Given I create one new teams`, async () => {
            await user.sdk.platform.createGroup({
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
            teamsSection.nthConversationEntry(0).enter();
        });

        // await h(t).withLog('And upload one file to the message input area of the created conversation ', async () => {
        //     await conversationPage.uploadFilesToMessageFilesArea(filesPath);
        // });

        await h(t).withLog('streamWrapper exists', async () => {
          await t.expect(conversationPage.streamWrapper.exists).ok();
        });

        await h(t).withLog('messageInputArea exists', async () => {
           await t.expect(conversationPage.messageInputArea.exists).ok();
        });

        await h(t).withLog('And upload one file to the conversation stream of the created conversation ', async () => {
          await conversationPage.uploadFilesToConversation(filesPath);
        });

        await h(t).withLog('Then I can send message to this conversation', async () => {
            await conversationPage.sendMessage(message);
        });

        await h(t).withLog('And I can read this message from post list', async () => {
            await t.expect(conversationPage.nthPostItem(-1).body.withText(message).exists).ok();
            // todo check files

        }, true);

    });


test(formalName(
    'JPT-457 Will show the prompt when re-upload an existing file in the conversation;JPT-455 Check the display of the duplicate file prompt;JPT-498 Can cancel when clicking cancel button in the duplicate prompt',
    ['P1', 'P2', 'UploadFiles', 'Mia.Cai', 'JPT-457', 'JPT-455', 'JPT-498']), async t => {
        const app = new AppRoot(t);
        const users = h(t).rcData.mainCompany.users;
        const user = users[0];
        user.sdk = await h(t).getSdk(user);
        const teamsSection = app.homePage.messageTab.teamsSection;
        const conversationPage = app.homePage.messageTab.conversationPage;
        const filesPath = ['./sources/file1.txt', './sources/file2.txt',];

        await h(t).withLog(`Given I create one new teams`, async () => {
            await user.sdk.platform.createGroup({
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
            teamsSection.nthConversationEntry(0).enter();
        });

        await h(t).withLog('And drag/drop files to the conversation directly ', async () => {
            await conversationPage.uploadFilesToConversation(filesPath);
        });

        //todo
        await h(t).withLog('And waitting for the post sent successfully', async () => {
            await t.wait(5e6);
        });

        await h(t).withLog('And drag/drop files to the conversation again ', async () => {
            await conversationPage.uploadFilesToConversation(filesPath);
        });

        //todo
        await h(t).withLog('Then will show a duplicate prompt ', async () => {

        });
    });

test(formalName(
    'JPT-499 Can update files when click update the button in the duplicate prompt',
    ['P1', 'UploadFiles', 'Mia.Cai', 'JPT-499']), async t => {


    });

test(formalName(
    'JPT-500 Can create files when click create button in the duplicate prompt',
    ['P1', 'UploadFiles', 'Mia.Cai', 'JPT-500']), async t => {


    });
