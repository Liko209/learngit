import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('ConversationList/OpenConversation')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Should remains where it is when click a conversation in the conversation list.', ['P2', 'JPT-464', 'ConversationList', 'Yilia Hong']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);
    const teamName1 = `Team 1 ${uuid()}`;
    const teamName2 = `Team 2 ${uuid()}`
    const teamsSection = app.homePage.messageTab.teamsSection;

    let teamId, nth;
    await h(t).withLog('Given I have an extension with two conversation', async () => {
      await user.sdk.platform.createGroup({
        type: 'Team',
        name: teamName1,
        members: [user.rcId, users[5].rcId],
      });

      await user.sdk.platform.createGroup({
        type: 'Team',
        name: teamName2,
        members: [user.rcId, users[6].rcId],
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('When I open the second conversation 2', async () => {
      await teamsSection.expand();
      nth = (await teamsSection.conversations.count) - 1;
      await teamsSection.nthConversationEntry(nth).enter();
      teamId = await app.homePage.messageTab.conversationPage.currentGroupId;
      await t.wait(3e3); // wait api save in DB
    });

    await h(t).withLog('Then the conversation 2 still remain in the second', async () => {
      await teamsSection.nthConversationEntry(nth).groupIdShouldBe(teamId);
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
    user.sdk = await h(t).getSdk(user);
    const teamName = `Team ${uuid()}`;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let teamId, NEW_URL;
    await h(t).withLog('Given I have a conversation', async () => {
      teamId = (await user.sdk.platform.createGroup({
        name: teamName,
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
    });

    await h(t).withLog('The conversation should be closed before login', async () => {
      await user.sdk.glip.hideGroups(user.rcId, [teamId]);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension} and URL contain ${teamId}`, async () => {
      NEW_URL = `${SITE_URL}/messages/${teamId}`;
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

test(formalName('Shouldn not display in conversation list when last conversation was closed', ['P2', 'JPT-566', 'ConversationList', 'Yilia Hong']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);
    const teamName = `Team ${uuid()}`;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let teamId;
    await h(t).withLog('Given I have a conversation', async () => {
      teamId = (await user.sdk.platform.createGroup({
        name: teamName,
        type: 'Team',
        members: [user.rcId, users[5].rcId],
      })).data.id;
    });

    await h(t).withLog('The conversation should be last conversation', async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
      await teamsSection.conversationEntryById(teamId).enter();
      await t.wait(3000);
      await app.homePage.openSettingMenu();
      await app.homePage.settingMenu.ensureLoaded();
      await app.homePage.settingMenu.clickLogout();
    });

    await h(t).withLog('The last conversation should be closed before login', async () => {
      await user.sdk.glip.hideGroups(user.rcId, [teamId]);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the conversation should not display in conversation list', async () => {
      await t.expect(teamsSection.conversationEntryById(teamId).exists).notOk();
      const url = await h(t).href;
      await t.expect(url).eql(`${SITE_URL}/messages/`);
    });
  },
);