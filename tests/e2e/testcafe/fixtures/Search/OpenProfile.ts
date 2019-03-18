/*
 * @Author: Potar.He 
 * @Date: 2019-03-01 10:44:59 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-18 19:03:37
 */
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';

fixture('Search/Profile')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Check can open profile dialog when click the item of search result', ['P1', 'JPT-1213', 'search', 'Potar.He']), async (t) => {
  const me = h(t).rcData.mainCompany.users[5];
  const anotherUser = h(t).rcData.mainCompany.users[6];
  await h(t).glip(me).init();
  const anotherUserName = await h(t).glip(me).getPersonPartialData('display_name', anotherUser.rcId);

  let team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: me,
    members: [me],
  };
  let group = <IGroup>{
    type: 'DirectMessage',
    owner: me,
    members: [me, anotherUser, h(t).rcData.mainCompany.users[7]],
  };

  await h(t).log(`Given I have an extension "${me.company.number}#${me.extension}"`);

  await h(t).withLog(`And with a team named: ${team.name} and a group include ${anotherUserName}`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team, group]);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.search;

  const searchResults = [{
    keyword: anotherUserName,
    item: searchBar.nthPeople(0),
    type: "result",
  }, {
    keyword: anotherUserName,
    item: searchBar.nthGroup(0),
    type: "groups",
  }, {
    keyword: team.name,
    item: searchBar.nthTeam(0),
    type: "teams",
  }]

  const profileDialog = app.homePage.profileDialog;
  for (const result of searchResults) {
    const { keyword, item, type } = result;
    await h(t).withLog(`When I search keyword ${keyword} and click the first ${type} result`, async () => {
      await searchBar.clearInputAreaText();
      await searchBar.typeSearchKeyword(keyword);
      await t.expect(item.exists).ok();
      await item.enter();
    });

    await h(t).withLog(`Then Profile dialog should be popup and search result should be closed`, async () => {
      await profileDialog.shouldBePopUp();
      await t.expect(searchBar.searchResultsContainer.exists).notOk();
    });

    await h(t).withLog(`When I close the profile dialog`, async () => {
      await profileDialog.close();
    });

    await h(t).withLog(`Then Keep the search text in the search box`, async () => {
      await t.expect(searchBar.inputArea.value).eql(keyword);
    });

    await h(t).withLog(`When I click the search box`, async () => {
      await searchBar.clickInputArea();
    });

    await h(t).withLog(`Then display instant search`, async () => {
      await t.expect(item.exists).ok();
    });
  }

  // recently search 
  await h(t).withLog(`Given I clear search box text`, async () => {
    await searchBar.clearInputAreaText();
    await searchBar.quitByPressEsc();
  });

  const recentHistoryCount = searchResults.length;
  for (const i of _.range(recentHistoryCount)) {
    await h(t).withLog(`When I click the search box`, async () => {
      await searchBar.clickInputArea();
    })

    let resultName;
    await h(t).withLog(`Then recently search result should be showed`, async () => {
      await searchBar.shouldShowRecentlyHistory();
      resultName = await searchBar.itemsNames.nth(recentHistoryCount - 1).textContent
    });

    await h(t).withLog(`When I click the last one: ${resultName}`, async () => {
      await searchBar.nthAllResults(recentHistoryCount - 1).enter();
    })

    await h(t).withLog(`Then Profile dialog should be popup and recently search result should be closed`, async () => {
      await profileDialog.shouldBePopUp();
      await t.expect(searchBar.historyContainer.exists).notOk();
    });

    await h(t).withLog(`When I close the profile dialog`, async () => {
      await profileDialog.close();
    });

    await h(t).withLog(`Then the search text should be clean`, async () => {
      await t.expect(searchBar.inputArea.value).eql('');
    });
  }

});