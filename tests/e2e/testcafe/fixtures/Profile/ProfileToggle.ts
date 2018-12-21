import { formalName } from '../../libs/filter';
import { v4 as uuid } from 'uuid';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { SITE_URL, BrandTire } from '../../config';

declare var test: TestFn;
fixture('ProfileToggle')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


const title = 'Profile';
test(formalName('Open a team/group conversation from team/group profile, then close by message button in profile',
  ['JPT-408', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let favChatId, teamId, urlAfterClose;
    await h(t).withLog('Given I have an extension with group chat A and 1 team chat B',
      async () => {
        teamId = (await user.sdk.platform.createGroup({
          isPublic: true,
          name: uuid(),
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
        favChatId = (await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversa(tions should not be hidden before login', async () => {
      await user.sdk.glip.showGroups(user.rcId, [favChatId, teamId])
      await user.sdk.glip.favoriteGroups(user.rcId, [+ favChatId])
    });

    await h(t).withLog('And I clean all UMI before login',
      async () => {
        const unreadGroups = await user.sdk.glip.getIdsOfGroupsWithUnreadMessages(user.rcId);
        await user.sdk.glip.markAsRead(user.rcId, unreadGroups);
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );
    const favChat = favoritesSection.conversationEntryById(favChatId);
    const teamChat = teamsSection.conversationEntryById(teamId);

    await h(t).withLog('Then I can find the 2 conversations in conversation list', async () => {
      await favoritesSection.expand();
      await t.expect(favChat.exists).ok(favChatId, { timeout: 10e3 });
      await teamsSection.expand();
      await t.expect(teamChat.exists).ok(teamId, { timeout: 10e3 });
    }, true);

    const groupList = {
      group: favChat,
      team: teamChat
    }

    const idList = {
      group: favChatId,
      team: teamId
    }

    const dialog = app.homePage.messageTab.profileModal;
    for (const key in groupList) {
      const item = groupList[key];

      await h(t).withLog(`When I click a ${key} conversation profile button`, async () => {
        await item.openMoreMenu();
        await app.homePage.messageTab.moreMenu.profile.enter();
      });

      await h(t).withLog(`Then a ${key} conversation profile dialog should be popup`, async () => {
        await t.expect(dialog.getSelector('hr').exists).ok();
        await t.expect(dialog.getSelector('div').withText(title).exists).ok();
      });

      await h(t).withLog(`When I click a ${key} conversation profile dialog message button`, async () => {
        await t.wait(2e3);
        await dialog.message();
      });

      await h(t).withLog(`The ${key} conversation profile dialog dissmis, and open the conversations`,
        async () => {
          urlAfterClose = await h(t).href
          const urlArray = urlAfterClose.split('/');
          await t.expect(dialog.exists).notOk();
          await t.expect(item.exists).ok()
          await t.expect(urlArray[urlArray.length - 1]).eql(idList[key], 'URL is changed')
          await t.wait(2e3);
        },
      );
    }
  },
);


test(formalName('Open profile via conversation list',
  ['JPT-450', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const dmSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;

    let favChatId, pvtChatId, teamId;
    await h(t).withLog('Given I have an extension with 1 private chat A and 1 team chat B and 1 group chat C',
      async () => {
        pvtChatId = (await user.sdk.platform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        teamId = (await user.sdk.platform.createGroup({
          isPublic: true,
          name: uuid(),
          type: 'Team',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
        favChatId = (await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${pvtChatId}`]: false,
        [`hide_group_${favChatId}`]: false,
        [`hide_group_${teamId}`]: false,
        favorite_group_ids: [+favChatId],
      });
    });

    await h(t).withLog('And I clean all UMI before login',
      async () => {
        const unreadGroups = await user.sdk.glip.getIdsOfGroupsWithUnreadMessages(user.rcId);
        await user.sdk.glip.markAsRead(user.rcId, unreadGroups);
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    const pvtChat = dmSection.conversationEntryById(pvtChatId);
    const favChat = favoritesSection.conversationEntryById(favChatId);
    const teamChat = teamsSection.conversationEntryById(teamId);

    await h(t).withLog('Then I can find the 3 conversations in conversation list', async () => {
      await dmSection.expand();
      await t.expect(pvtChat.exists).ok(pvtChatId, { timeout: 10e3 });
      await favoritesSection.expand();
      await t.expect(favChat.exists).ok(favChatId, { timeout: 10e3 });
      await teamsSection.expand();
      await t.expect(teamChat.exists).ok(teamId, { timeout: 10e3 });
    }, true);

    const groupList = {
      favChat: favChat,
      pvtChat: pvtChat,
      teamChat: teamChat
    }

    const dialog = app.homePage.messageTab.profileModal;
    for (const key in groupList) {
      const item = groupList[key];

      await h(t).withLog(`When I click a ${key} conversation profile button`, async () => {
        await item.openMoreMenu();
        await app.homePage.messageTab.moreMenu.profile.enter();
      });

      await h(t).withLog(`Then a ${key} conversation profile dialog should be popup`, async () => {
        await t.expect(dialog.getSelector('hr').exists).ok();
        await t.expect(dialog.getSelector('div').withText(title).exists).ok();
      });

      await h(t).withLog(`When I click a ${key} conversation profile dialog close button`, async () => {
        await t.wait(2e3);
        await app.homePage.messageTab.profileModal.close();
      });

      await h(t).withLog(`The ${key} conversation profile dialog dissmis`,
        async () => {
          await t.expect(dialog.exists).notOk();
        },
      );
    }
  },
);