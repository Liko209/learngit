/*
 * @Author: Andy Hu(andy.hu@ringcentral.com)
 * @Date: 2018-10-25 13:44:44
 * Copyright Â© RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { AppRoot } from '../../../v2/page-models/AppRoot/index';
import { formalName } from '../../../libs/filter';
import { h } from '../../../v2/helpers';
import { teardownCase, setupCase } from '../../../init';
import { BrandTire, SITE_URL } from '../../../config';
import { IGroup } from '../../../v2/models';

fixture('ConversationStream/ConversationStream')
    .beforeEach(setupCase(BrandTire.RCOFFICE))
    .afterEach(teardownCase());


test(formalName('Check if other notification settings is implemented correctly', ['JPT-2110', 'P2', 'Settings']), async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    let privateChat = <IGroup>{
        type: "DirectMessage",
        owner: loginUser,
        members: [loginUser, otherUser]
    }

    let groupChat = <IGroup>{
        type: "DirectMessage",
        owner: loginUser,
        members: [loginUser, otherUser, users[7]]
    }

    let team = <IGroup>{
        type: "Team",
        name: uuid(),
        owner: loginUser,
        members: [loginUser, otherUser]
    }

    await h(t).withLog('Given I have an extension with certain conversations', async () => {
        await h(t).scenarioHelper.createTeamsOrChats([privateChat, groupChat, team]);
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
        await h(t).scenarioHelper.resetProfile(loginUser);
        await h(t).scenarioHelper.clearAllUmi(loginUser);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
        async () => {
            await h(t).directLoginWithUser(SITE_URL, loginUser);
            await app.homePage.ensureLoaded();
        },
    );
    await h(t).withLog('When other user send a post with @mention to the group', async () => {
        await h(t).scenarioHelper.sentAndGetTextPostId(`![:Person](${loginUser.rcId}), ${uuid()}`, groupChat, otherUser);
    });
    await h(t).withLog('When other user send a post with @mention to the team', async () => {
        await h(t).scenarioHelper.sentAndGetTextPostId(`![:Person](${loginUser.rcId}), ${uuid()}`, team, otherUser);
    });
    await h(t).withLog('When other user send a post to the team', async () => {
        await h(t).scenarioHelper.sentAndGetTextPostId(`${uuid()}`, team, otherUser);
    });

    const settingsEntry = app.homePage.leftPanel.settingsEntry;
    const settingTab = app.homePage.settingTab;
    const settingPage = settingTab.notificationAndSoundPage;

    await h(t).withLog(`Then I click Setting entry`, async () => {
        await settingsEntry.enter();
    });
    await h(t).withLog(`And I click Notification tab`, async () => {
        await settingTab.notificationAndSoundsEntry.enter();
    });
    await h(t).withLog(`And I click new message badge count DropDown`, async () => {
        await settingPage.clickNewMessageBadgeCountDropDown();
    });
    await h(t).withLog(`And I click @mention and direct message only`, async () => {
        await settingPage.selectNewMessageBadgeCount('Direct messages and mentions only');
    });
    await h(t).withLog('Then check UMI in Messages UMI=1+1+0=2 ', async () => {
        await t.expect(await app.homePage.leftPanel.messagesEntry.getUmi()).eql(2);
    });
    await h(t).withLog(`And I click new message badge count DropDown`, async () => {
        await settingPage.clickNewMessageBadgeCountDropDown();
    });
    await h(t).withLog(`When I click all new messages`, async () => {
        await settingPage.selectNewMessageBadgeCount('All new messages');
    });
        await h(t).withLog('Then check UMI in Messages UMI=1+1+1=3 ', async () => {
        await t.expect(await app.homePage.leftPanel.messagesEntry.getUmi()).eql(3);
    });
});
