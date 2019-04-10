/*
 * @Author: Potar.He
 * @Date: 2019-02-28 14:12:13
 * @Last Modified by: isaac.liu
 * @Last Modified time: 2019-03-22 15:04:36
 */

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';

fixture('Recently Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open and close the recently searched list', ['JPT-1216', 'P1', 'Search', 'Potar.He']), async (t) => {
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

  const searchBar = app.homePage.header.search;
  await h(t).withLog(`And make some recently search history with ${beSearchedName}`, async () => {
    await searchBar.typeSearchKeyword(beSearchedName);
    await searchBar.nthPeople(0).enter();
    await searchBar.clearInputAreaText();
    await searchBar.quitByPressEsc();
  });

  for (let i = 0; i < 2; i++) {
    await h(t).withLog(`When mouse in the global search box`, async () => {
      await searchBar.clickInputArea();
    });

    await h(t).withLog(`Then the recently searched dropdown list displayed`, async () => {
      await searchBar.shouldShowRecentlyHistory();
      await t.expect(searchBar.allResultItems.count).eql(1);
    });

    await h(t).withLog(`When tap ESC keyboard`, async () => {
      await t.pressKey('ESC');
    });

    await h(t).withLog(`Then the recently searched dropdown list should disappear and global search box is no focus`, async () => {
      await t.expect(searchBar.historyContainer.exists).notOk();
      await t.expect(searchBar.inputArea.focused).notOk();
    });
  }
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

  const searchBar = app.homePage.header.search;
  await h(t).withLog(`When mouse in the global search box`, async () => {
    await searchBar.clickInputArea();
  });

  await h(t).withLog(`Then there is no recently searched dropdown list displayed`, async () => {
    await t.expect(searchBar.historyContainer.exists).notOk();
  });

  await h(t).withLog(`When make some recently search history with ${beSearchedName}`, async () => {
    await searchBar.typeSearchKeyword(beSearchedName);
    await searchBar.nthPeople(0).enter();
    await searchBar.clearInputAreaText();
    await searchBar.quitByPressEsc();
  });

  await h(t).withLog(`And mouse in the global search box`, async () => {
    await searchBar.clickInputArea();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchBar.shouldShowRecentlyHistory();
    await t.expect(searchBar.allResultItems.count).eql(1);
    await t.expect(searchBar.getSearchItemByName(beSearchedName).exists).ok();
  });

  await h(t).withLog(`When click the “Clear History” button`, async () => {
    await searchBar.clickClearHistory();
  });

  await h(t).withLog(`Then the recently searched list should be cleared`, async () => {
    await t.expect(searchBar.allResultItems.exists).notOk();
  });

  await h(t).withLog(`Then the dropdown list should disappear`, async () => {
    await t.expect(searchBar.historyContainer.exists).notOk();
  });

  await h(t).withLog(`Then the global search inbox should remain focused`, async () => {
    await t.expect(searchBar.inputArea.focused).ok();
  });
});
