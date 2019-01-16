/*
 * @Author: Yilia Hong (yilia.hong@ringcentral.com)
 * @Date: 2018-12-24 14:01:17
 * Copyright © RingCentral. All rights reserved.
 */
import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('ConversationList/OpenConversation')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

// requirement changed https://jira.ringcentral.com/browse/FIJI-2491 https://jira.ringcentral.com/browse/FIJI-2267
test.skip(formalName('Should remains where it is when click a conversation in the conversation list.', ['P2', 'JPT-464', 'ConversationList', 'Yilia Hong']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();

    const teamName1 = `Team 1 ${uuid()}`;
    const teamName2 = `Team 2 ${uuid()}`
    const teamsSection = app.homePage.messageTab.teamsSection;

    let teamId;
    await h(t).withLog('Given I have an extension with two conversation', async () => {
      await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: teamName1,
        members: [loginUser.rcId, users[5].rcId],
      });

      await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: teamName2,
        members: [loginUser.rcId, users[6].rcId],
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('When I open the second conversation 2', async () => {
      await teamsSection.expand();
      await teamsSection.nthConversationEntry(-1).enter();
      teamId = await app.homePage.messageTab.conversationPage.currentGroupId;
      await t.wait(3e3); // wait api save in DB
    });

    await h(t).withLog('Then the conversation 2 still remain in the second', async () => {
      await teamsSection.nthConversationEntry(-1).groupIdShouldBe(teamId);
    });

    await h(t).withLog('When I refresh page', async () => {
      await h(t).refresh();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the conversation 2 display in the top', async () => {
      await teamsSection.nthConversationEntry(0).groupIdShouldBe(teamId);
    });
  },
);

test(formalName('Should display in the top when open a closed conversation from URL', ['P2', 'JPT-563', 'ConversationList', 'Yilia Hong']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    await h(t).platform(user).init();
    await h(t).glip(user).init();

    const teamName = `Team ${uuid()}`;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let teamId, NEW_URL;
    await h(t).withLog('Given I have a conversation', async () => {
      teamId = await h(t).platform(user).createAndGetGroupId({
        name: teamName,
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      });
    });

    await h(t).withLog('The conversation should be closed before login', async () => {
      await h(t).glip(user).hideGroups([teamId]);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension} and URL contain ${teamId}`, async () => {
      const url = new URL(SITE_URL)
      NEW_URL = `${url.protocol}//${url.hostname}/messages/${teamId}`;
      await h(t).directLoginWithUser(NEW_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the conversation should display in the top of conversation list', async () => {
      await teamsSection.expand();
      await teamsSection.nthConversationEntry(0).groupIdShouldBe(teamId);
    });

    await h(t).withLog('When I refresh page', async () => {
      await h(t).refresh();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the conversation still display in the top', async () => {
      await teamsSection.nthConversationEntry(0).groupIdShouldBe(teamId);
    });
  },
);

test(formalName('Should not display in conversation list when last conversation was closed', ['P2', 'JPT-566', 'ConversationList', 'Yilia Hong']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    await h(t).platform(user).init();
    await h(t).glip(user).init();
    const teamName = `Team ${uuid()}`;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let teamId;
    await h(t).withLog('Given I have a conversation', async () => {
      teamId = await h(t).platform(user).createAndGetGroupId({
        name: teamName,
        type: 'Team',
        members: [user.rcId, users[5].rcId],
      });
    });

    await h(t).withLog('The conversation should be last conversation', async () => {
      await h(t).glip(user).setLastGroupId(teamId);
    });

    await h(t).withLog('The last conversation should be closed before login', async () => {
      await h(t).glip(user).hideGroups([teamId]);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the conversation should not display in conversation list', async () => {
      await t.expect(teamsSection.conversationEntryById(teamId).exists).notOk();
      const url = new URL(SITE_URL);
      const targetUrl = `${url.protocol}//${url.hostname}/messages/`
      await H.retryUntilPass(async () => {
        const currentUrl = await h(t).href;
        assert.strictEqual(currentUrl, targetUrl, `${currentUrl} is invalid`);
      });
    });
  },
);
