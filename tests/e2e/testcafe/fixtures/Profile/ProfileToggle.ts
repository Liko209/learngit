import { formalName } from '../../libs/filter';
import { v4 as uuid } from 'uuid';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';

declare var test: TestFn;
fixture('Profile/ProfileToggle')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


const title = 'Profile';
test(formalName('Open a team/group conversation from team/group profile, then close by message button in profile',
  ['JPT-408', 'P2', 'ProfileToggle', 'Looper']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let favoriteChatId, teamId;
    await h(t).withLog('Given I have an extension with 1 group (in favorite) chat and 1 team chat', async () => {
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        isPublic: true,
        name: uuid(),
        type: 'Team',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
      favoriteChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
    });

    await h(t).withLog('All conversations should not be hidden before login', async () => {
      await h(t).glip(loginUser).favoriteGroups([+ favoriteChatId])
    });

    await h(t).withLog('And I clean all UMI before login',
      async () => {
        const unreadGroups = await h(t).glip(loginUser).getIdsOfGroupsWithUnreadMessages();
        await h(t).glip(loginUser).markAsRead(unreadGroups);
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );
    const favoriteChat = favoritesSection.conversationEntryById(favoriteChatId);
    const teamChat = teamsSection.conversationEntryById(teamId);

    await h(t).withLog('Then I can find the 2 conversations in conversation list', async () => {
      await favoritesSection.expand();
      await t.expect(favoriteChat.exists).ok(favoriteChatId, { timeout: 10e3 });
      await teamsSection.expand();
      await t.expect(teamChat.exists).ok(teamId, { timeout: 10e3 });
    }, true);

    const groupList = {
      group: favoriteChat,
      team: teamChat
    }

    const idList = {
      group: favoriteChatId,
      team: teamId
    }

    const profileDialog = app.homePage.profileDialog;
    const conversationPage = app.homePage.messageTab.conversationPage;

    for (const key in groupList) {
      const item = groupList[key];

      await h(t).withLog(`When I click a ${key} conversation profile button`, async () => {
        await item.enter();
        await conversationPage.openMoreButtonOnHeader();
        await conversationPage.headerMoreMenu.openProfile();
      });

      await h(t).withLog(`Then a ${key} conversation profile dialog should be popup`, async () => {
        await profileDialog.ensureLoaded();
      });

      await h(t).withLog(`When I click a ${key} conversation profile dialog message button`, async () => {
        await profileDialog.goToMessages();
      });

      await h(t).withLog(`The ${key} conversation profile dialog dismiss, and open the conversations`, async () => {
        await t.expect(profileDialog.exists).notOk();
        await app.homePage.messageTab.conversationPage.groupIdShouldBe(idList[key]);
      });
    }
  },
);


test(formalName('Open profile via conversation list', ['JPT-450', 'P2', 'ProfileToggle', 'Looper']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();

  const dmSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const favoritesSection = app.homePage.messageTab.favoritesSection;

  let favoriteChatId, privateChatId, teamId;
  await h(t).withLog('Given I have an extension with 1 private chat A and 1 team chat B and 1 group (in favorite) chat C',
    async () => {
      privateChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat',
        members: [loginUser.rcId, users[5].rcId],
      });
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        isPublic: true,
        name: uuid(),
        type: 'Team',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
      favoriteChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
      await h(t).glip(loginUser).favoriteGroups([+favoriteChatId]);
    },
  );

  await h(t).withLog('And I clean all UMI before login',
    async () => {
      const unreadGroups = await h(t).glip(loginUser).getIdsOfGroupsWithUnreadMessages();
      await h(t).glip(loginUser).markAsRead(unreadGroups);
    },
  );

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    },
  );

  const pvtChat = dmSection.conversationEntryById(privateChatId);
  const favChat = favoritesSection.conversationEntryById(favoriteChatId);
  const teamChat = teamsSection.conversationEntryById(teamId);

  await h(t).withLog('Then I can find the 3 conversations in conversation list', async () => {
    await dmSection.expand();
    await t.expect(pvtChat.exists).ok(privateChatId, { timeout: 10e3 });
    await favoritesSection.expand();
    await t.expect(favChat.exists).ok(favoriteChatId, { timeout: 10e3 });
    await teamsSection.expand();
    await t.expect(teamChat.exists).ok(teamId, { timeout: 10e3 });
  }, true);

  const groupList = {
    favChat: favChat,
    pvtChat: pvtChat,
    teamChat: teamChat
  }

  const profileDialog = app.homePage.profileDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;

  for (const key in groupList) {
    const item = groupList[key];

    await h(t).withLog(`When I click a ${key} conversation profile button`, async () => {
      await item.enter();
      await conversationPage.openMoreButtonOnHeader();
      await conversationPage.headerMoreMenu.openProfile();
    });

    await h(t).withLog(`Then a ${key} conversation profile dialog should be popup`, async () => {
      await profileDialog.ensureLoaded();
    });

    await h(t).withLog(`When I click a ${key} conversation profile dialog close button`, async () => {
      await profileDialog.clickCloseButton();
    });

    await h(t).withLog(`The ${key} conversation profile dialog dismiss`, async () => {
      await t.expect(profileDialog.exists).notOk();
    },
    );
  }
});

test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ['JPT-409'],
  keywords: ['ProfileToggle'],
  maintainers: ['ProfileToggle']
})('Favorite/Unfavorite a conversation from profile', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7]
  await h(t).scenarioHelper.resetProfileAndState(loginUser);

  let chat = <IGroup>{
    type: "DirectMessage",
    members: [loginUser, users[5]],
    owner: loginUser
  }

  let group = <IGroup>{
    type: "Group",
    members: [loginUser, users[5], users[6]],
    owner: loginUser
  }

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    members: [loginUser, users[5], users[6]],
    owner: loginUser
  }

  await h(t).withLog('Given I have an extension with 1 private chat A and 1 team chat B and 1 group chat C', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat, group, team]);
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
    await teamsSection.expand();
    await directMessagesSection.expand();
    await favoritesSection.expand();
  });

  const privateChat = directMessagesSection.conversationEntryById(chat.glipId);
  const groupChat = directMessagesSection.conversationEntryById(group.glipId);
  const teamChat = teamsSection.conversationEntryById(team.glipId);

  const groupList = {
    groupChat,
    privateChat,
    teamChat,
  }

  const profileDialog = app.homePage.profileDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;

  for (const kind in groupList) {
    const conversation = groupList[kind];
    let chatId: string = '';
    let chatName = '';

    // favorite
    await h(t).withLog(`When I click a {kind} conversation "{chatName}" profile button`, async (step) => {
      await conversation.enter();
      chatId = await conversation.groupId;
      chatName = await conversation.name;
      await conversationPage.openMoreButtonOnHeader();
      await conversationPage.headerMoreMenu.openProfile();
      step.initMetadata({ kind, chatName });
    });

    await h(t).withLog(`Then a {kind} conversation profile dialog should be popup`, async (step) => {
      step.setMetadata('kind', kind);
      await profileDialog.ensureLoaded();
    });

    await h(t).withLog(`When I click a {kind} conversation profile dialog "unfavorite" icon`, async (step) => {
      step.setMetadata('kind', kind);
      await t.click(profileDialog.unFavoriteStatusIcon);
    });

    await h(t).withLog(`The "unfavorite" icon change to "favorite" icon`, async () => {
      await t.expect(profileDialog.unFavoriteStatusIcon.exists).notOk();
      await t.expect(profileDialog.favoriteStatusIcon.exists).ok();
    });

    await h(t).withLog(`When I click a {kind} conversation profile dialog close button`, async (step) => {
      step.setMetadata('kind', kind);
      await profileDialog.clickCloseButton();
    });

    await h(t).withLog(`Then the profile dialog dismiss`, async () => {
      await profileDialog.ensureDismiss();
    });

    await h(t).withLog(`And The {kind} conversation "{chatName}" move to favorites section`, async (step) => {
      step.initMetadata({ kind, chatName });
      await conversation.ensureDismiss();
      await favoritesSection.conversationEntryById(chatId).ensureLoaded();
    });

    // un favorite
    await h(t).withLog(`When I click a {kind} conversation profile button on favorite section`, async (step) => {
      step.setMetadata('kind', kind);
      await favoritesSection.conversationEntryById(chatId).enter();
      await conversationPage.openMoreButtonOnHeader();
      await conversationPage.headerMoreMenu.openProfile();
    });

    await h(t).withLog(`Then a {kind} conversation profile dialog should be popup`, async (step) => {
      step.setMetadata('kind', kind);
      await t.expect(profileDialog.getSelector('hr').exists).ok();
      await t.expect(profileDialog.getSelector('div').withText(title).exists).ok();
    });

    await h(t).withLog(`When I click a {kind} conversation profile dialog "favorite" icon`, async (step) => {
      step.setMetadata('kind', kind);
      await t.click(profileDialog.favoriteStatusIcon);
    });

    await h(t).withLog(`The "favorite" icon change to "unfavorite" icon`, async () => {
      await profileDialog.ensureLoaded();
    });

    await h(t).withLog(`When I click a {kind} conversation profile dialog close button`, async (step) => {
      step.setMetadata('kind', kind);
      await profileDialog.clickCloseButton();
    });

    await h(t).withLog(`Then the profile dialog dismiss`, async () => {
      await profileDialog.ensureDismiss();
    });

    await h(t).withLog(`And The {kind} conversation {chatName }move to original section`, async (step) => {
      step.initMetadata({ kind, chatName });
      await conversation.ensureLoaded();
      await favoritesSection.conversationEntryById(chatId).ensureDismiss();
    });
  }
});
