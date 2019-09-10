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

test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ['JPT-408'],
  keywords: ['ProfileToggle'],
  maintainers: ['looper', 'potar.he']
})('Open a team/group conversation from team/group profile, then close by message button in profile', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  await h(t).scenarioHelper.resetProfileAndState(loginUser);

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
  };


  await h(t).withLog('Given I have an extension with chat, group, team', async () => {
    await h(t).scenarioHelper.resetProfileAndState(loginUser);
    await h(t).scenarioHelper.createTeamsOrChats([group, team]);
    await h(t).glip(loginUser).favoriteGroups(group.glipId);
  });

  const favoritesSection = app.homePage.messageTab.favoritesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();

    await teamsSection.expand();
    await favoritesSection.expand();
  });


  const favoriteChat = favoritesSection.conversationEntryById(group.glipId);
  const teamChat = teamsSection.conversationEntryById(team.glipId);

  const groupList = {
    group: favoriteChat,
    team: teamChat
  }

  const idList = {
    group: group.glipId,
    team: team.glipId
  }

  const profileDialog = app.homePage.profileDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;

  for (const kind in groupList) {
    const conversation = groupList[kind];

    await h(t).withLog(`When I click a {kind} conversation profile button`, async (step) => {
      step.setMetadata('kind', kind);
      await conversation.enter();
      await conversationPage.openMoreButtonOnHeader();
      await conversationPage.headerMoreMenu.openProfile();
    });

    await h(t).withLog(`Then a {kind} conversation profile dialog should be popup`, async (step) => {
      step.setMetadata('kind', kind);
      await profileDialog.ensureLoaded();
    });

    await h(t).withLog(`When I click a {kind} conversation profile dialog message button`, async (step) => {
      step.setMetadata('kind', kind);
      await profileDialog.goToMessages();
    });

    await h(t).withLog(`The {kind} conversation profile dialog dismiss, and open the conversations`, async (step) => {
      step.setMetadata('kind', kind);
      await t.expect(profileDialog.exists).notOk();
      await app.homePage.messageTab.conversationPage.groupIdShouldBe(idList[kind]);
    });
  }
});

test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ['JPT-409'],
  keywords: ['ProfileToggle'],
  maintainers: ['Looper', 'Potar.He']
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

  await h(t).withLog('Given I have an extension with chat, group, team', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat, group, team]);
  });

  await h(t).withLog('And send a message to ensure chat and group in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
    await h(t).scenarioHelper.sendTextPost('for appear in section', group, loginUser);
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
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
    let chatId = '';
    let chatName = '';

    // favorite
    await h(t).withLog(`When I click a {kind} conversation "{chatName}" profile button`, async (step) => {
      step.initMetadata({ kind });
      await conversation.enter();
      chatId = await conversation.groupId;
      chatName = await conversation.name;
      await conversationPage.openMoreButtonOnHeader();
      await conversationPage.headerMoreMenu.openProfile();
      step.updateMetadata({ chatName });
    });

    await h(t).withLog(`Then a {kind} conversation profile dialog should be popup`, async (step) => {
      step.setMetadata('kind', kind);
      await profileDialog.ensureLoaded();
      await t.expect(profileDialog.profileTitle.withText(title).exists).ok();
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
      await profileDialog.ensureLoaded();
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
