/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { v4 as uuid } from 'uuid';
import { SITE_URL, BrandTire } from '../../config';
import { setupCase, teardownCase } from '../../init';

fixture('send messages draft')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Show massage draft when switching conversation', ['P0', 'JPT-139']),
  async (t) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    let teamId1, teamId2, conversation1, conversation2;
    await h(t).withLog('Given I have an extension with 1 private chat A and 1 group chat B', async () => {
      teamId1 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `1 ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId]
      });
      teamId2 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `2 ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId, users[6].rcId]
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    const teamSection = app.homePage.messageTab.teamsSection;
    await h(t).withLog('Then I can check conversation A and B exist', async () => {
      await teamSection.expand();
      conversation1 = teamSection.conversationEntryById(teamId1);
      conversation2 = teamSection.conversationEntryById(teamId2);
      await t.expect(conversation1.exists).ok({ timeout: 10e3 });
      await t.expect(conversation2.exists).ok({ timeout: 10e3 });
    });

    const msg = uuid();
    const inputField = app.homePage.messageTab.conversationPage.messageInputArea;
    await h(t).withLog(`And I enter conversation A to type message "${msg}"`, async () => {
      await conversation1.enter();
      await t.typeText(inputField, msg)
    }, true);

    await h(t).withLog('When I enter conversation B', async () => {
      await conversation2.enter();
    });

    await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
      await t.expect(conversation1.hasDraftMessage).ok();
    });

    await h(t).withLog(`When I enter conversation A`, async () => {
      await conversation1.enter();
    });

    await h(t).withLog(`Then I can find input field still is ${msg}`, async () => {
      await t.expect(conversation1.hasDraftMessage).notOk();
      await t.expect(inputField.textContent).eql(msg);
    });
  });

test(formalName('Show massage draft if only has files when switching conversation', ['P2', 'JPT-139']),
  async (t) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    const filesPath1 = ['../../sources/1.txt'];
    let teamId1, teamId2, conversation1, conversation2;
    await h(t).withLog('Given I have an extension with 1 private chat A and 1 group chat B', async () => {
      teamId1 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `1 ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId]
      });
      teamId2 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `2 ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId, users[6].rcId]
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    const teamSection = app.homePage.messageTab.teamsSection;
    await h(t).withLog('Then I can check conversation A and B exist', async () => {
      await teamSection.expand();
      conversation1 = teamSection.conversationEntryById(teamId1);
      conversation2 = teamSection.conversationEntryById(teamId2);
      await t.expect(conversation1.exists).ok({ timeout: 10e3 });
      await t.expect(conversation2.exists).ok({ timeout: 10e3 });
    });

    await h(t).withLog('And I enter conversation A to select file', async () => {
      await conversation1.enter();
      const { conversationPage } = app.homePage.messageTab;
      conversationPage.uploadFilesToMessageAttachment(filesPath1);
    }, true);

    await h(t).withLog('When I enter conversation B', async () => {
      await conversation2.enter();
    });

    await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
      await t.expect(conversation1.hasDraftMessage).ok();
    });

    await h(t).withLog(`Then I send the message, "Draft" icon should not exist `, async () => {
      await conversation1.enter();
      const { conversationPage } = app.homePage.messageTab;
      const msg = uuid();
      conversationPage.sendMessage(msg);
      await t.expect(conversation1.hasDraftMessage).notOk();
    });

    await h(t).withLog('When I enter conversation B, the "Draft" icon should not show on right of Conversation A', async () => {
      await conversation2.enter();
      await t.expect(conversation1.hasDraftMessage).notOk();
    });
  });
