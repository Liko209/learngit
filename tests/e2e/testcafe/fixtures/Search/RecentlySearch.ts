/*
 * @Author: Potar.He
 * @Date: 2019-02-28 14:12:13
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-04-09 17:30:38
 */

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from '../../v2/models';

fixture('Recently Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
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
    await searchDialog.nthPeople(0).enter();
  });

  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed`, async () => {
    await searchDialog.shouldShowRecentlyHistory();
    await t.expect(searchDialog.allResultItems.count).eql(1);
  });

  await h(t).withLog(`When tap ESC keyboard`, async () => {
    await app.quitByPressEsc();
  });

  await h(t).withLog(`Then the search dialog dismiss`, async () => {
    await searchDialog.ensureDismiss();
  });

  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed`, async () => {
    await searchDialog.shouldShowRecentlyHistory();
    await t.expect(searchDialog.allResultItems.count).eql(1);
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
    await searchDialog.shouldShowRecentlyHistory();
    await t.expect(searchDialog.allResultItems.count).eql(1);
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

  await h(t).withLog(`And I login Jupiter with this extension ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;

  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then there is no recently searched dropdown list displayed`, async () => {
    await t.expect(searchDialog.allResultItems.exists).notOk();
  });

  await h(t).withLog(`When make some recently search history with ${beSearchedName}`, async () => {
    await searchDialog.typeSearchKeyword(beSearchedName);
    await searchDialog.nthPeople(0).enter();
  });

  await h(t).withLog(`And mouse in the global search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.shouldShowRecentlyHistory();
    await t.expect(searchDialog.allResultItems.count).eql(1);
    await t.expect(searchDialog.getSearchItemByName(beSearchedName).exists).ok();
  });

  await h(t).withLog(`When click the “Clear History” button`, async () => {
    await searchDialog.clickClearHistory();
  });

  await h(t).withLog(`Then the recently searched list should be cleared`, async () => {
    await t.expect(searchDialog.allResultItems.exists).notOk();
  });

  await h(t).withLog(`Then the search dialog input box should remain focused`, async () => {
    await t.expect(searchDialog.inputArea.focused).ok();
  });
});
