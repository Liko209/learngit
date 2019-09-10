/*
 * @Author: Mia Cai (mia.cai@ringcentral.com)
 */
import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import * as _ from 'lodash';
import { IGroup, ITestMeta } from "../../v2/models";

fixture('ConversationList/maxConversation')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

const DEFAULT_MAX_NUMBER = 20;
test.meta(<ITestMeta>{
  priority: ['P1', 'P2'],
  caseIds: ['JPT-58', 'JPT-344'],
  keywords: ['ConversationList', 'maxConversation'],
  maintainers: ['Mia.Cai', 'Potar.He']
})('JPT-58 Show conversations with limit count conversations, older unread and current opened; \
JPT-344 The conversation will disappear when removing one older conversation from Fav and the section shows >= limit count conversations', async (t: TestController) => {
    const createdNum = 6;
    const MAX_NUMBER = 3;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    const otherUser = users[5];

    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;

    await h(t).withLog('Given I have a new account (via reset profile and state )', async () => {
      await h(t).scenarioHelper.resetProfileAndState(loginUser);
      await h(t).platform(otherUser).init();
    });

    let favoriteTeam = <IGroup>{
      type: 'Team',
      name: uuid(),
      owner: loginUser,
      members: [loginUser]
    }

    await h(t).withLog(`And I create one new teams`, async () => {
      await h(t).scenarioHelper.createTeam(favoriteTeam);
    });

    await h(t).withLog(`And 1.favorite the created team(JPT-344) 2.Set limit conversation count=${MAX_NUMBER}(JPT-58)`, async () => {
      await h(t).glip(loginUser).setMaxTeamDisplay(MAX_NUMBER);
      await h(t).glip(loginUser).favoriteGroups([favoriteTeam.glipId]);
      await h(t).glip(loginUser).setLastGroupId(favoriteTeam.glipId);
    });

    const teams = Array.from({ length: createdNum }, (x, i) => <IGroup>{
      name: `${i + 1}-${uuid()}`,
      type: "Team",
      owner: loginUser,
      members: [loginUser, otherUser]
    });

    const umiIds = [0, 4, 5];
    for (let i = teams.length - 1; i >= 0; i--) {
      await h(t).withLog(`And I create new conversation${i + 1}`, async () => {
        await h(t).scenarioHelper.createTeam(teams[i]);
      });
      if (_.includes(umiIds, i)) {
        await h(t).withLog(`And make conversation${i + 1} has unread`, async () => {
          await h(t).platform(otherUser).sendTextPost(`${uuid()} ![:Person](${loginUser.rcId})`, teams[i].glipId);
        })
      }
    }

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    }, true);

    const realNum = 5;
    await h(t).withLog(`Then max conversation count should be exceeded, total number should be ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum);
    }, true);

    const newTeamIds = teams.map(team => team.glipId);
    await h(t).withLog('And all new teams except the conversation.4 should be found in the team section', async () => {
      let expectNewTeamIds = Array.from(newTeamIds);
      expectNewTeamIds.splice(3, 1);
      for (let i = 0; i < expectNewTeamIds.length; i++) {
        await t.expect(teamsSection.conversationEntryById(expectNewTeamIds[i]).exists).ok(i.toString());
      }
      await t.expect(teamsSection.conversationEntryById(newTeamIds[3]).exists).notOk();
    });

    const conversation1 = teamsSection.conversationEntryById(newTeamIds[0]);
    const conversation5 = teamsSection.conversationEntryById(newTeamIds[4]);
    await h(t).withLog('When I click the unread conversation.1 ', async () => {
      await conversation1.enter();
    });

    await h(t).withLog('And I navigate away from conversation.1 (click conversation.5 )', async () => {
      await conversation5.enter();
    });

    await h(t).withLog('Then unread conversation.1 should remain in the section', async () => {
      await t.expect(conversation1.exists).ok();
    });

    await h(t).withLog('And unread conversation.5 should remain in the section', async () => {
      await t.expect(conversation5.exists).ok();
    });

    await h(t).withLog('When I navigate away from conversation.5 (click conversation.1 )', async () => {
      await conversation1.enter();
    });

    await h(t).withLog('Then conversation.5 should be hide', async () => {
      await t.expect(conversation5.exists).notOk();
    });

    await h(t).withLog('When the hide conversation.5 received new message ', async () => {
      await h(t).platform(otherUser).createPost({ text: `${uuid()} ![:Person](${loginUser.rcId})` }, newTeamIds[4]);
    });

    await h(t).withLog('Then All new teams except the conversation.3/4 should be found in the team section', async () => {
      const expectNewTeamIds = Array.from(newTeamIds);
      expectNewTeamIds.splice(2, 2);
      for (let i = 0; i < expectNewTeamIds.length; i++) {
        await t.expect(teamsSection.conversationEntryById(expectNewTeamIds[i]).exists).ok({ timeout: 8e3 });
      }
      await t.expect(teamsSection.conversationEntryById(newTeamIds[2]).exists).notOk();
      await t.expect(teamsSection.conversationEntryById(newTeamIds[3]).exists).notOk();
    });

    // case: JPT-344  remove one older team from fav
    const favConversation = favoritesSection.conversationEntryById(favoriteTeam.glipId);
    await h(t).withLog(`When remove the team ${favoriteTeam.glipId} from fav`, async () => {
      await favConversation.openMoreMenu();
      await app.homePage.messageTab.moreMenu.favoriteToggler.enter();
    });

    await h(t).withLog('The older fav team will disappear', async () => {
      await t.expect(favConversation.exists).notOk();
      await h(t).glip(loginUser).setMaxTeamDisplay(DEFAULT_MAX_NUMBER);
    });
  }
);


test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ["JPT-353", "JPT-310", "JPT-342"],
  keywords: ['ConversationList'],
  maintainers: ['Mia.Cai', "Potar.he"]
})('JPT-353 maxConversation=limit conversation count(without unread); \
JPT-310 Shouldn\'t automatically bring up an older conversation when remove one conversation; \
JPT-342 The conversation will be back to the section when removing one conversation from Fav and it isn\'t older than the conversation list', async (t: TestController) => {
    const MAX_NUMBER = 3;
    let realNum = MAX_NUMBER;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    const teams = Array.from({ length: MAX_NUMBER }, (x, i) => <IGroup>{
      name: `${i}-${uuid()}`,
      type: "Team",
      owner: loginUser,
      members: [loginUser]
    })

    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;

    await h(t).withLog('Given clear all UMIs before login', async () => {
      await h(t).glip(loginUser).clearAllUmi();
    });

    await h(t).withLog(`And set limit conversation count=${MAX_NUMBER}(JPT-353)`, async () => {
      await h(t).glip(loginUser).setMaxTeamDisplay(MAX_NUMBER)
    });

    await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login', async () => {
      await h(t).glip(loginUser).skipCloseConversationConfirmation(true);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`And I create ${MAX_NUMBER} new teams`, async () => {
      await h(t).scenarioHelper.createTeams(teams);
    });

    await h(t).withLog('And make sure current opened conversation isn\'t older team)', async () => {
      await teamsSection.nthConversationEntry(0).enter();
    });

    // case JPT-353
    await h(t).withLog(`Then max conversation count should be limited, total number should be ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum, { timeout: 10e3 });
    });

    await h(t).withLog(`When I refresh page`, async () => {
      await h(t).reload();
      await app.homePage.ensureLoaded();
      await app.homePage.messageTab.ensureLoaded(10e3);
    });

    await h(t).withLog(`Then max conversation count = ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum, { timeout: 10e3 });
    });

    // case JPT-310
    await h(t).withLog("When I click conversation.3's close buttom", async () => {
      await teamsSection.nthConversationEntry(2).openMoreMenu();
      await app.homePage.messageTab.moreMenu.close.enter();
    });

    realNum = MAX_NUMBER - 1;
    await h(t).withLog(`Then max conversation count = ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum, { timeout: 5e3 });
    });

    await h(t).withLog("When I click conversation.2's favorite buttom", async () => {
      await teamsSection.nthConversationEntry(1).openMoreMenu();
      await app.homePage.messageTab.moreMenu.favoriteToggler.enter();
    });

    realNum = realNum - 1;
    await h(t).withLog(`Then max conversation count = ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum, { timeout: 5e3 });
    });

    // case JPT-342
    const favConversation = favoritesSection.nthConversationEntry(0);
    await h(t).withLog("When I remove conversation.2 from favorite", async () => {
      await favConversation.openMoreMenu();
      await app.homePage.messageTab.moreMenu.favoriteToggler.enter();
    });

    await h(t).withLog('Then conversation.2 is back to the section', async () => {
      await t.expect(teamsSection.nthConversationEntry(1).exists).ok();
    });

    realNum = realNum + 1;
    await h(t).withLog(`And max conversation count = ${realNum}`, async () => {
      await t.expect(teamsSection.conversations.count).eql(realNum, { timeout: 5e3 });
      await h(t).glip(loginUser).setMaxTeamDisplay(DEFAULT_MAX_NUMBER);
    });
  }
);

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-247'],
  maintainers: ['ali.naffaa'],
  keywords: ['ConversationList'],
})(`The Favorites section won't be affected by settings of max conversations`, async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  const MAX_NUMBER = 5
  await h(t).withLog('Given set user max conversation display number is {MAX_NUMBER} ', async (step) => {
    step.setMetadata('MAX_NUMBER', MAX_NUMBER.toString());
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init(true);
    await h(t).glip(loginUser).setMaxTeamDisplay(MAX_NUMBER);
  });

  const favConversationCount = MAX_NUMBER + 1
  let teamsId = [];

  await h(t).scenarioHelper.resetProfileAndState(loginUser);

  await h(t).withLog('And user has more than {MAX_NUMBER} conversations in the Fav section', async (step) => {
    step.setMetadata('MAX_NUMBER', MAX_NUMBER.toString());
    const oldTeamsId: any[] = await h(t).glip(loginUser).getTeams().then(res => res.data.teams
      .filter(team => !team.is_archived && !team.deactivated && !!team.members)
      .map(team => team._id));
    const needCreatedCount = favConversationCount - oldTeamsId.length
    if (needCreatedCount > 0) {
      teamsId.concat(oldTeamsId)
      for (let i = 0; i < needCreatedCount; i++) {
        let team = <IGroup>{
          type: "Team",
          name: uuid(),
          owner: loginUser,
          members: [loginUser],
        };
        await h(t).scenarioHelper.createTeam(team).then(() => teamsId.push(team.glipId));
      }
    } else {
      teamsId = teamsId.concat(oldTeamsId.slice(0, favConversationCount))
    }
    await h(t).glip(loginUser).favoriteGroups(teamsId);
  });

  await h(t).withLog(`And I login Jupiter with host {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  ;

  const favoritesSection = app.homePage.messageTab.favoritesSection;
  await h(t).withLog('Then all conversations {favConversationCount} are displayed in Favorite section', async (step) => {
    step.setMetadata('favConversationCount', favConversationCount.toString());

    await favoritesSection.expand();
    for (let teamId of teamsId) {
      await favoritesSection.conversationEntryById(teamId).ensureLoaded();
    }
    await t.expect(favoritesSection.conversations.count).eql(favConversationCount);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2851'],
  maintainers: ['andy.hu'],
  keywords: ['ConversationList'],
})('Check the max conversations is worked properly', async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  const MAX_NUMBER = 5

  await h(t).withLog('Given clear all UMIs before login', async () => {
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).clearAllUmi();
  });

  await h(t).withLog(`And I login Jupiter with host {number}#{extension}`, async (step) => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I create ${MAX_NUMBER+1} new teams`, async () => {
    const teams = Array.from({ length: MAX_NUMBER+1 }, (x, i) => <IGroup>{
      name: `${i}-${uuid()}`,
      type: "Team",
      owner: loginUser,
      members: [loginUser]
    })
    await h(t).scenarioHelper.createTeams(teams);
  });

  await h(t).withLog('Given set user max conversation display number is {MAX_NUMBER } ', async (step) => {
    const settingsEntry = app.homePage.leftPanel.settingsEntry;
    const settingTab = app.homePage.settingTab;
    const messageSettingPage = settingTab.messageSettingPage;
    await settingsEntry.enter();
    await settingTab.messagesEntry.enter();
    await messageSettingPage.clickMaxConversationSelectBox();
    await t.click(messageSettingPage.maxConversationDropDownItems.nth(MAX_NUMBER-2))
  });

  const favConversationCount = MAX_NUMBER + 1
  let teamsId = [];

  await h(t).withLog('And I switch back to message tab', async (step) => {
    await app.homePage.leftPanel.messagesEntry.enter()
  });

  await h(t).withLog(`And user has no more than ${MAX_NUMBER} teams on left panel`, async (step) => {
    await t.expect(app.homePage.messageTab.teamsSection.conversations.count).eql(MAX_NUMBER)
  });

  await h(t).withLog('And user has more than {MAX_NUMBER} conversations in the Fav section', async (step) => {
    const oldTeamsId: any[] = await h(t).glip(loginUser).getTeams().then(res => res.data.teams
      .filter(team => !team.is_archived && !team.deactivated && !!team.members)
      .map(team => team._id));
    const needCreatedCount = favConversationCount - oldTeamsId.length
    if (needCreatedCount > 0) {
      teamsId.concat(oldTeamsId)
      for (let i = 0; i < needCreatedCount; i++) {
        let team = <IGroup>{
          type: "Team",
          name: uuid(),
          owner: loginUser,
          members: [loginUser],
        };
        await h(t).scenarioHelper.createTeam(team).then(() => teamsId.push(team.glipId));
      }
    } else {
      teamsId = teamsId.concat(oldTeamsId.slice(0, favConversationCount))
    }
    await h(t).glip(loginUser).favoriteGroups(teamsId);
  });

  const favoritesSection = app.homePage.messageTab.favoritesSection;
  await h(t).withLog('Then all conversations {favConversationCount} are displayed in Favorite section', async (step) => {
    step.setMetadata('favConversationCount', favConversationCount.toString());

    await favoritesSection.expand();
    for (let teamId of teamsId) {
      await favoritesSection.conversationEntryById(teamId).ensureLoaded();
    }
    await t.expect(favoritesSection.conversations.count).eql(favConversationCount);
  });
});
