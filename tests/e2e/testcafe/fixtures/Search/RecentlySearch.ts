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

  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(1);
  });

  await h(t).withLog(`Whe I click outside the global search box`, async () => {
    await t.click(searchDialog.self, { offsetX: 1, offsetY: 1 });
  });

  await h(t).withLog(`Then the search dialog dismiss`, async () => {
    await searchDialog.ensureDismiss();
  });

  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(1);
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
  const userNameC = await h(t).glip(loginUser).getPersonPartialData('display_name', users[7].rcId);

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
    await searchDialog.instantPage.nthPeople(0).HoverAndClickMessageButton();
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
  // await h(t).withLog(`When I search ${userNameC} and hover the people result and click call icon then close`, async () => {
  //   await searchDialog.typeSearchKeyword(userNameC);
  //   resultName = await searchDialog.instantPage.nthPeople(0).getName();
  //   await searchDialog.instantPage.nthPeople(0).makeCall();
  //   await app.homePage.telephonyDialog.ensureLoaded(60e3);
  //   await app.homePage.telephonyDialog.clickHandUpButton();
  // });


  // await h(t).withLog(`And mouse in the global search box`, async () => {
  //   await searchBar.clickSelf();
  // });

  // recentHistoryNumber += 1;
  // await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
  //   await searchDialog.recentPage.ensureLoaded();
  //   await t.expect(searchDialog.recentPage.items.count).eql(recentHistoryNumber);
  //   await t.expect(searchDialog.recentPage.conversationByName(resultName).exists).ok();
  // });

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