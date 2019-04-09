/*
 * @Author: Potar.He
 * @Date: 2019-02-28 14:12:13
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-04-09 16:42:37
 */

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';

fixture('Recently Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open and close the recently search/instant search/search dialog', ['JPT-1216', 'P1', 'Search', 'Potar.He']), async (t) => {
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

  // todo other steps
});


test(formalName('Clear recent search history', ['JPT-1217', 'P1', 'Search', 'Potar.He']), async (t) => {
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
    await t.expect(searchDialog.historyContainer.exists).notOk();
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

  await h(t).withLog(`Then the global search inbox should remain focused`, async () => {
    await t.expect(searchBar.inputArea.focused).ok();
  });
});
