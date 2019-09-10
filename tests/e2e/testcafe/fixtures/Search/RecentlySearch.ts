/*
 * @Author: Potar.He
 * @Date: 2019-02-28 14:12:13
 * @Last Modified by: Nello Huang (nello.huang@ringcentral.com)
 * @Last Modified time: 2019-04-11 14:18:47
 */

import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';
import * as uuid from 'uuid';


fixture('Recently Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1216'],
  maintainers: ['potar.he'],
  keywords: ['search'],
})('Open and close the recently search/instant search/search dialog', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const beSearchedUser = users[5]
  await h(t).glip(loginUser).init();
  const beSearchedName = await h(t).glip(loginUser).getPersonPartialData('display_name', beSearchedUser.rcId);

  await h(t).withLog(`Given I login Jupiter with this extension ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`And make some recently search history with ${beSearchedName}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(beSearchedName);
    await searchDialog.instantPage.nthPeople(0).enter();
  });

  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(1);
  });

  await h(t).withLog(`When tap ESC keyboard`, async () => {
    await searchDialog.quitByPressEsc();
  });

  await h(t).withLog(`Then the search dialog dismiss`, async () => {
    await searchDialog.ensureDismiss();
  });

  await h(t).withLog(`When I type ${beSearchedName} and click "in this conversation" content item`, async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(beSearchedName);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then the message tab on the full page should be opened`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`When tap ESC keyboard`, async () => {
    await searchDialog.quitByPressEsc();
  });

  await h(t).withLog(`Then the search dialog dismiss`, async () => {
    await searchDialog.ensureDismiss();
  });

  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(2);
  });

  await h(t).withLog(`Whe I click outside the global search box`, async () => {
    await t.click('html', { offsetX: 1, offsetY: 1 });
  });

  await h(t).withLog(`Then the search dialog dismiss`, async () => {
    await searchDialog.ensureDismiss();
  });

  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(2);
  });

  await h(t).withLog(`Whe I click Close icon`, async () => {
    await searchDialog.clickCloseButton();
  });

  await h(t).withLog(`Then the search dialog dismiss`, async () => {
    await searchDialog.ensureDismiss();
  });
});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1217'],
  maintainers: ['potar.he'],
  keywords: ['search'],
})('Clear recent search history', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const beSearchedUser = users[5]
  await h(t).glip(loginUser).init();
  const beSearchedName = await h(t).glip(loginUser).getPersonPartialData('display_name', beSearchedUser.rcId);

  await h(t).withLog(`Given I login Jupiter with this extension ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;

  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then there is no recently searched dropdown list displayed`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(0);
  });

  await h(t).withLog(`When make some recently search history with ${beSearchedName}`, async () => {
    await searchDialog.typeSearchKeyword(beSearchedName);
    await searchDialog.instantPage.nthPeople(0).enter();
  });

  await h(t).withLog(`And mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(1);
    await t.expect(searchDialog.recentPage.conversationByName(beSearchedName).exists).ok();
  });

  await h(t).withLog(`When click the “Clear History” button`, async () => {
    await searchDialog.recentPage.clickClearHistory();
  });

  await h(t).withLog(`Then the recently searched list should be cleared`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(0);
  });

  // skip due not yet implement
  // await h(t).withLog(`Then the search dialog input box should remain focused`, async () => {
  //   await t.expect(searchDialog.inputArea.focused).ok();
  // });
});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1323'],
  maintainers: ['potar.he'],
  keywords: ['search'],
})('Clear recent search history', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();
  const userNameA = await h(t).glip(loginUser).getPersonPartialData('display_name', users[5].rcId);
  const userNameB = await h(t).glip(loginUser).getPersonPartialData('display_name', users[6].rcId);

  let group = <IGroup>{
    type: "Group",
    owner: loginUser,
    members: [loginUser, users[5], users[7]]
  }
  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, users[5]]
  }

  let publicTeamWithoutMe = <IGroup>{
    type: "Team",
    isPublic: true,
    name: `${H.uuid()} publicWithoutMe`,
    owner: users[5],
    members: [users[5]]
  }

  await h(t).withLog(`Given I an extension which has one team and group with ${userNameA}`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([group, team, publicTeamWithoutMe]);
  });

  await h(t).withLog(`And I login Jupiter with this extension ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;

  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  let recentHistoryNumber = 0;
  await h(t).withLog(`Then there is no recently searched dropdown list displayed`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(recentHistoryNumber);
  });

  let resultName: string;
  await h(t).withLog(`When I search ${userNameA} and click the people result`, async () => {
    await searchDialog.typeSearchKeyword(userNameA);
    resultName = await searchDialog.instantPage.nthPeople(0).getName();
    await searchDialog.instantPage.nthPeople(0).enter();
  });

  await h(t).withLog(`And mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  recentHistoryNumber += 1;
  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(recentHistoryNumber);
    await t.expect(searchDialog.recentPage.conversationByName(resultName).exists).ok();
  });


  await h(t).withLog(`When I search ${userNameA} and click the group result`, async () => {
    await searchDialog.typeSearchKeyword(userNameA);
    resultName = await searchDialog.instantPage.nthGroup(0).getName();
    await searchDialog.instantPage.nthGroup(0).enter();
  });

  await h(t).withLog(`And mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  recentHistoryNumber += 1;
  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(recentHistoryNumber);
    await t.expect(searchDialog.recentPage.conversationByName(resultName).exists).ok();
  });

  await h(t).withLog(`When I search ${team.name} and click the team result`, async () => {
    await searchDialog.typeSearchKeyword(team.name);
    resultName = await searchDialog.instantPage.nthTeam(0).getName();
    await searchDialog.instantPage.nthTeam(0).enter();
  });

  await h(t).withLog(`And mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  recentHistoryNumber += 1;
  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(recentHistoryNumber);
    await t.expect(searchDialog.recentPage.conversationByName(resultName).exists).ok();
  });

  await h(t).withLog(`When I search ${userNameB} and hover the people result and click message icon`, async () => {
    await searchDialog.typeSearchKeyword(userNameB);
    resultName = await searchDialog.instantPage.nthPeople(0).getName();
    await searchDialog.instantPage.nthPeople(0).hoverAndClickMessageButton();
  });

  await h(t).withLog(`And mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  recentHistoryNumber += 1;
  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(recentHistoryNumber);
    await t.expect(searchDialog.recentPage.conversationByName(resultName).exists).ok();
  });

  //  move "make call" entry to telephony fixtures

  await h(t).withLog(`When I search ${publicTeamWithoutMe.name} and hover the team result then tap join button then close join dialog`, async () => {
    await searchDialog.typeSearchKeyword(publicTeamWithoutMe.name);
    resultName = await searchDialog.instantPage.nthTeam(0).getName();
    await searchDialog.instantPage.nthTeam(0).join();
    await app.homePage.joinTeamDialog.clickCancelButton();
  });


  await h(t).withLog(`And mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  recentHistoryNumber += 1;
  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(recentHistoryNumber);
    await t.expect(searchDialog.recentPage.conversationByName(resultName).exists).ok();
  });

  const keyword = uuid();
  await h(t).withLog(`When I search any text ${keyword} and click the first content search item`, async () => {
    await searchDialog.typeSearchKeyword(keyword);
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
  });

  await h(t).withLog(`And open recently search page`, async () => {
    await searchDialog.clickClearButton();
  });

  recentHistoryNumber += 1;
  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(recentHistoryNumber);
    await t.expect(searchDialog.recentPage.contentInGlobalBYName(keyword).exists).ok();
  });

  await h(t).withLog(`When I open the team ${team.name} search any text ${keyword} and click the content in this conversation item`, async () => {
    await searchDialog.clickCloseButton();
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(keyword);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`And open recently search page`, async () => {
    await searchDialog.clearInputAreaTextByKey();
  });

  recentHistoryNumber += 1;
  let displayContent = `${keyword} in this conversation`
  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(recentHistoryNumber);
    await t.expect(searchDialog.recentPage.contentInConversationByName(displayContent).exists).ok();
  });

  await h(t).withLog(`When I close the recently search and open another conversation`, async () => {
    await searchDialog.quitByPressEsc();
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(group.glipId).enter();
    await searchBar.clickSelf();
  });

  displayContent = `${keyword} in ${team.name}`
  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(recentHistoryNumber);
    await t.expect(searchDialog.recentPage.contentInConversationByName(displayContent).exists).ok();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1214'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['search'],
})('Re-login to check the recently searched list', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const userA = users[0];;
  const loginUser = users[6];
  const groupUser = users[2];
  await h(t).glip(loginUser).init();
  const nameUserA = await h(t).glip(loginUser).getPersonPartialData('display_name', userA.rcId);
  const groupName = await h(t).glip(loginUser).getPersonPartialData('display_name', groupUser.rcId);

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser, users[1]],
  };

  const group = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [loginUser, groupUser],
  };

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`And make 3 records on searched list, group: {groupName} team: {teamName} user: {nameUserA}`, async (step) => {
    step.initMetadata({ groupName, nameUserA, teamName: team.name });
    await h(t).scenarioHelper.createTeamsOrChats([team, group]);
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(groupName);
    await t.click(searchDialog.instantPage.peoples.withText(groupName));
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(team.name);
    await t.click(searchDialog.instantPage.teams.withText(team.name));
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(nameUserA);
    await t.click(searchDialog.instantPage.peoples.withText(nameUserA));
  });

  await h(t).withLog('When I check the recently searched list', async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog('Then there are 3 items on the recently searched list', async () => {
    await t.expect(searchDialog.recentPage.conversationItems.count).eql(3);
    await searchDialog.clickCloseButton();
  });

  await h(t).withLog(`And logout and Re-login the app with the same account`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I tab or mouse in the global search box', async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog('Then there is no dropdown list displayed', async () => {
    await t.expect(searchDialog.recentPage.conversationItems.count).eql(0);
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1237'],
  maintainers: ['alexander.zaverukha', 'potar.he'],
  keywords: ['search'],
})('Check the sort of the recently searched list', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const antherUser = users[2];

  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();

  const searchedUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', antherUser.rcId);

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  };

  const group = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [loginUser, antherUser, users[1]]
  };

  const contentKeyword = uuid();
  await h(t).withLog(`Given I have team name : ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team, group]);
  })

  await h(t).withLog(`Given I login Jupiter : ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  const itemsInSearchOrder = [];
  await h(t).withLog(`When search ${contentKeyword} and make content search item in recently search`, async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(contentKeyword);
    itemsInSearchOrder.unshift(await searchDialog.instantPage.contentSearchGlobalEntry.textContent)
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.clickCloseButton();
  });

  await h(t).withLog('And I tab or mouse in the global search box', async () => {
    await app.homePage.header.searchBar.clickSelf();
  });

  await h(t).withLog(`Then  the items should be sorted in the reverse chronological order, with the most recently searched item on the top of the list`, async () => {
    await t.expect(searchDialog.recentPage.itemsNames.count).eql(itemsInSearchOrder.length);
    const count = await searchDialog.recentPage.itemsNames.count;
    for (let i = 0; i < count; i++) {
      await t.expect(searchDialog.recentPage.itemsNames.nth(i).textContent).eql(itemsInSearchOrder[i]);
    }
    await searchDialog.clickCloseButton();
  });

  await h(t).withLog(`When search ${searchedUserName} and make first people name item in recently search`, async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(searchedUserName);
    await t.expect(searchDialog.instantPage.peoples.count).gte(0);
    itemsInSearchOrder.unshift(await searchDialog.instantPage.nthPeople(0).name.textContent)
    await searchDialog.instantPage.nthPeople(0).enter();
  });

  await h(t).withLog('And I tab or mouse in the global search box', async () => {
    await app.homePage.header.searchBar.clickSelf();
  });

  await h(t).withLog(`Then the items should be sorted in the reverse chronological order, with the most recently searched item on the top of the list`, async () => {
    await t.expect(searchDialog.recentPage.itemsNames.count).eql(itemsInSearchOrder.length);
    const count = await searchDialog.recentPage.itemsNames.count;
    for (let i = 0; i < count; i++) {
      await t.expect(searchDialog.recentPage.itemsNames.nth(i).textContent).eql(itemsInSearchOrder[i]);
    }
    await searchDialog.clickCloseButton();
  });

  await h(t).withLog(`When search ${team.name} and make first team name item in recently search`, async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(team.name);
    await t.expect(searchDialog.instantPage.teams.exists).ok();
    itemsInSearchOrder.unshift(await searchDialog.instantPage.nthTeam(0).name.textContent)
    await searchDialog.instantPage.nthTeam(0).enter();
  });

  await h(t).withLog('And I tab or mouse in the global search box', async () => {
    await app.homePage.header.searchBar.clickSelf();
  });

  await h(t).withLog(`Then the items should be sorted in the reverse chronological order, with the most recently searched item on the top of the list`, async () => {
    await t.expect(searchDialog.recentPage.itemsNames.count).eql(itemsInSearchOrder.length);
    const count = await searchDialog.recentPage.itemsNames.count;
    for (let i = 0; i < count; i++) {
      await t.expect(searchDialog.recentPage.itemsNames.nth(i).textContent).eql(itemsInSearchOrder[i]);
    }
    await searchDialog.clickCloseButton();
  });


  await h(t).withLog(`When search ${searchedUserName} and make first group name item in recently search`, async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(searchedUserName);
    await t.expect(searchDialog.instantPage.groups.exists).ok();
    itemsInSearchOrder.unshift(await searchDialog.instantPage.nthGroup(0).name.textContent)
    await searchDialog.instantPage.nthGroup(0).enter();
  });

  await h(t).withLog('And I tab or mouse in the global search box', async () => {
    await app.homePage.header.searchBar.clickSelf();
  });

  await h(t).withLog(`Then the items should be sorted in the reverse chronological order, with the most recently searched item on the top of the list`, async () => {
    await t.expect(searchDialog.recentPage.itemsNames.count).eql(itemsInSearchOrder.length);
    const count = await searchDialog.recentPage.itemsNames.count;
    for (let i = 0; i < count; i++) {
      await t.expect(searchDialog.recentPage.itemsNames.nth(i).textContent).eql(itemsInSearchOrder[i]);
    }
    await searchDialog.clickCloseButton();
  });
});


fixture('Recently Search')
  .beforeEach(setupCase(BrandTire.RC_USERS_20))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1228'],
  maintainers: ['alexander.zaverukha', 'potar.he'],
  keywords: ['search'],
})('Recently searched list can be synced in time', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const admin = users[2];
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();


  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: admin,
    members: [loginUser, admin],
  };

  let historyCount = 6;
  await h(t).withLog(`Given I have team named ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`Given I login Jupiter : ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`And have ${historyCount} records on searched list items on the recently search list and it contains team: ${team.name}`, async () => {
    const nineUsers = users.slice(0, historyCount - 1);
    for (const user of nineUsers) {
      await searchBar.clickSelf();
      await searchDialog.typeSearchKeyword(user.extension);
      await searchDialog.instantPage.nthPeople(0).enter();
    }
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(team.name);
    await t.click(searchDialog.instantPage.teams.withExactText(team.name));
  });

  await h(t).withLog('When I tab or mouse in the global search box', async () => {
    await app.homePage.header.searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed ${historyCount} items and it contains team:  ${team.name}`, async () => {
    await t.expect(searchDialog.recentPage.conversationItems.count).eql(historyCount);
    await t.expect(searchDialog.recentPage.conversationByName(team.name).exists).ok();
  });

  await h(t).withLog(`When I delete team ${team}`, async () => {
    await h(t).platform(admin).deleteTeam(team.glipId);
  });

  historyCount -= 1;
  await h(t).withLog(`Then the ${team.name} item disappear immediately and just only show ${historyCount} contact items`, async () => {
    await t.expect(searchDialog.recentPage.items.count).eql(historyCount, { timeout: 10e3 });
    await searchDialog.recentPage.conversationByName(team.name).ensureDismiss();
  });

  await h(t).withLog(`When I tap ESC keyboard`, async () => {
    await searchDialog.quitByPressEsc();
  });

  await h(t).withLog('And I tab or mouse in the global search box', async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed with ${historyCount} items and not contains team: ${team.name}`, async () => {
    await t.expect(searchDialog.instantPage.items.count).eql(historyCount);
    await searchDialog.recentPage.conversationByName(team.name).ensureDismiss();
  });

  await h(t).withLog(`When create team again then search it`, async () => {
    await h(t).scenarioHelper.createTeam(team);
    await searchDialog.typeSearchKeyword(team.name);
    await t.click(searchDialog.instantPage.teams.withText(team.name));
  });

  await h(t).withLog('And I tab or mouse in the global search box', async () => {
    await searchBar.clickSelf();
  });

  historyCount += 1;
  await h(t).withLog(`Then the recently searched dropdown list displayed ${historyCount} items and it contains team:  ${team.name}`, async () => {
    await t.expect(searchDialog.recentPage.conversationItems.count).eql(historyCount);
    await searchDialog.recentPage.conversationByName(team.name).ensureLoaded();
  });

  await h(t).withLog(`When I archive team ${team.name}`, async () => {
    await h(t).platform(admin).archiveTeam(team.glipId);
  });

  historyCount -= 1;
  await h(t).withLog(`Then the ${team.name} item disappear immediately and just only show ${historyCount} contact items`, async () => {
    await t.expect(searchDialog.recentPage.items.count).eql(historyCount, { timeout: 10e3 });
    await searchDialog.recentPage.conversationByName(team.name).ensureDismiss();
  });

  await h(t).withLog(`When I tap ESC keyboard`, async () => {
    await searchDialog.quitByPressEsc();
  });

  await h(t).withLog('And I tab or mouse in the global search box', async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed with ${historyCount} items and not contains team: ${team.name}`, async () => {
    await t.expect(searchDialog.recentPage.items.count).eql(historyCount);
    await searchDialog.recentPage.conversationByName(team.name).ensureDismiss();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1238'],
  maintainers: ['alexander.zaverukha', 'potar.he'],
  keywords: ['search'],
})('Check the UI of the recently searched list', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[2];
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  const userName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);
  const contentName = 'Ring';
  const contentNameInThisConversation = `${contentName} in this conversation`;
  let searchItemsNames = [];

  //UI
  const headerTitle = 'Recent searches';
  const clearButtonText = 'Clear history';

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser]
  };

  const group = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [loginUser, anotherUser, users[1]]
  };

  await h(t).withLog(`Given I have one group with extension ${anotherUser.extension} and one team named: ${team.name},`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team, group]);
  });

  await h(t).withLog(`And I login Jupiter : ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the new created team', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;

  await h(t).withLog(`When I search 7 people one by one `, async () => {
    const sevenUsers = users.slice(0, 7);
    for (const user of sevenUsers) {
      await searchBar.clickSelf();
      await searchDialog.typeSearchKeyword(user.extension);
      const peopleName = await searchDialog.instantPage.nthPeople(0).name.textContent;
      searchItemsNames.unshift(peopleName);
      await searchDialog.instantPage.nthPeople(0).enter();
    }
  });

  await h(t).withLog(`And I search ${userName} and click the group`, async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(userName);
    const groupName = await searchDialog.instantPage.nthGroup(0).name.textContent;
    searchItemsNames.unshift(groupName);
    await searchDialog.instantPage.nthGroup(0).enter();
  });

  await h(t).withLog(`And I search ${team.name} and click the group`, async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(team.name);
    const teamName = await searchDialog.instantPage.nthTeam(0).name.textContent;
    searchItemsNames.unshift(teamName);
    await searchDialog.instantPage.nthTeam(0).enter();
  });

  await h(t).withLog(`And I search ${contentName} and click the global content item`, async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(contentName);
    searchItemsNames.unshift(contentName);
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
    await searchDialog.clearInputAreaTextByKey();
  });

  await h(t).withLog('Then at most 10 items in recently searched list', async () => {
    await t.expect(searchDialog.recentPage.items.count).eql(10);
  });

  await h(t).withLog(`When I search ${contentName} and click content in this conversation item`, async () => {
    await searchDialog.typeSearchKeyword(contentName);
    searchItemsNames.unshift(contentNameInThisConversation);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
    await searchDialog.clearInputAreaTextByKey();
  });

  await h(t).withLog('Then at most 10 items in recently searched list', async () => {
    await t.expect(searchDialog.recentPage.items.count).eql(10);
  });

  await h(t).withLog(`And display "${headerTitle}" title`, async () => {
    await t.expect(searchDialog.recentPage.historyHeader.find('p').textContent).eql(headerTitle);
  });

  await h(t).withLog(`And display "${clearButtonText}" button`, async () => {
    await t.expect(searchDialog.recentPage.clearHistoryButton.textContent).eql(clearButtonText);
  });

  await h(t).withLog('And  "Close" icon ', async () => {
    await t.expect(searchDialog.closeButton.exists).ok();
  });

  await h(t).withLog('Content display "icon+content search text+ conversation name/in this conversation"', async () => {
    for (let i = 0; i < 2; i++) { // last two is content search
      await t.expect(searchDialog.recentPage.nthItemOfAll(i).name.textContent).eql(searchItemsNames[i]);
      await t.expect(searchDialog.recentPage.nthItemOfAll(i).avatar.exists).ok();
      await t.expect(searchDialog.recentPage.nthItemOfAll(i).contentIcon.exists).ok();
    }
  });

  await h(t).withLog('And item display Team/Group/People show "Avatar+Name"', async () => {
    for (let i = 2; i < 10; i++) {
      await t.expect(searchDialog.recentPage.nthItemOfAll(i).name.textContent).eql(searchItemsNames[i]);
      await t.expect(searchDialog.recentPage.nthItemOfAll(i).avatar.exists).ok();
      await t.expect(searchDialog.recentPage.nthItemOfAll(i).contentIcon.exists).notOk();
    }
  });
});