/*
 * @Author: Potar.He 
 * @Date: 2019-04-10 12:58:57 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-04-10 14:38:33
 */
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';
import * as uuid from 'uuid';

fixture('Contact Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1570'],
  maintainers: ['potar.he'],
  keywords: ['search'],
})('Check click show more button can open search result dialog', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).glip(loginUser).init();
  const searchKeyword = await h(t).glip(loginUser).getPersonPartialData('first_name', users[5].rcId);

  const teamNames = Array(4).fill(null).map(() => `${searchKeyword} ${H.uuid()}`);
  const teams: IGroup[] = teamNames.map(name => ({
    name,
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  }));

  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  for (const team of teams) {
    await h(t).withLog(`And have a team named: ${team.name}`, async () => {
      await h(t).scenarioHelper.createTeam(team);
    });
  }

  const app = new AppRoot(t)
  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword ${searchKeyword}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(searchKeyword);
  }, true);

  await h(t).withLog(`Then I should find 3 teams on search dialog and team result header has "show more" button`, async () => {
    await t.expect(searchDialog.instantPage.teams.count).eql(3);
    await t.expect(searchDialog.instantPage.showMoreTeamsButton.exists).ok();
  });

  await h(t).withLog(`When I click 'Show more' button`, async () => {
    await searchDialog.instantPage.clickShowMoreTeams();
  });

  await h(t).withLog(`Then search result team tab should be open`, async () => {
    await searchDialog.fullSearchPage.teamsTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display more data`, async () => {
    await t.expect(searchDialog.fullSearchPage.items.count).gte(4);
  });
})


// test.meta(<ITestMeta>{
//   priority: ['P0'],
//   caseIds: ['JPT-1562'],
//   maintainers: ['potar.he'],
//   keywords: ['search'],
// })('Check can search for messages in the search result dialog', async (t) => {
//   const users = h(t).rcData.mainCompany.users;
//   const loginUser = users[4];
//   const anotherUser = users[5];
//   await h(t).glip(loginUser).init();

//   const teamNames = Array(2).fill(null).map(() => `${H.uuid()}`);
//   const teams: IGroup[] = teamNames.map(name => ({
//     name,
//     type: 'Team',
//     owner: loginUser,
//     members: [loginUser, anotherUser],
//   }));
//   await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

//   for (const team of teams) {
//     await h(t).withLog(`And have a team named: ${team.name}`, async () => {
//       await h(t).scenarioHelper.createTeam(team);
//     });
//   }

//   const app = new AppRoot(t)
//   await h(t).withLog(`And I login with the extension`, async () => {
//     await h(t).directLoginWithUser(SITE_URL, loginUser);
//     await app.homePage.ensureLoaded();
//   });


//   const searchBar = app.homePage.header.searchBar;
//   const searchDialog = app.homePage.searchDialog;
//   await h(t).withLog(`When I search keyword ${teamNames[0]}`, async () => {
//     await searchBar.clickSelf();
//     await searchDialog.clearInputAreaTextByKey();
//     await searchDialog.typeSearchKeyword(teamNames[0]);
//   }, true);

//   await h(t).withLog(`And click search content in this conversation item`, async () => {
//     await searchDialog.clickContentSearchInThisConversationEntry();
//   });

//   await h(t).withLog(`Then search result team tab should be open`, async () => {
//     await searchDialog.teamsTabEntry.shouldBeOpened();
//   });

//   await h(t).withLog(`And display more data`, async () => {
//     await t.expect(searchDialog.allResultItems.count).gte(4);
//   });
// })