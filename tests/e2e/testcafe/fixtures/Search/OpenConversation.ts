/*
 * @Author: Potar.He
 * @Date: 2019-04-09 15:31:31
 * @Last Modified by: Nello Huang (nello.huang@ringcentral.com)
 * @Last Modified time: 2019-04-11 14:17:56
 */
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';

fixture('Search/conversation')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1213'],
  maintainers: ['potar.he'],
  keywords: ['search'],
})('Check can open conversation when clicking the item of search result', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const me = users[5];
  const anotherUser = users[6];
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
    members: [me, anotherUser, users[7]],
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

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;

  // people
  await h(t).withLog(`When I search keyword ${anotherUserName} and click the first people result`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(anotherUserName);
    await searchDialog.nthPeople(0).ensureLoaded();
    await searchDialog.nthPeople(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`Then the conversation should be opened`, async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.titleShouldBe(anotherUserName);
  });

  await h(t).withLog(`And No text in the search box`, async () => {
    await t.expect(searchBar.inputArea.value).eql("")
  });

  await h(t).withLog(`When I click the search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the people in recently search result`, async () => {
    await searchDialog.getSearchItemByName(anotherUserName).ensureLoaded();
  });

  // group
  let groupName;
  await h(t).withLog(`When I search keyword ${anotherUserName} and click the first group result`, async () => {
    await searchDialog.typeSearchKeyword(anotherUserName);
    await searchDialog.nthGroup(0).ensureLoaded();
    groupName = await searchDialog.nthGroup(0).name.textContent;
    await searchDialog.nthGroup(0).enter();
  });

  await h(t).withLog(`Then the conversation should be opened`, async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.titleShouldBe(groupName);
  });

  await h(t).withLog(`And No text in the search box`, async () => {
    await t.expect(searchBar.inputArea.value).eql("")
  });

  await h(t).withLog(`When I click the search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the group in recently search result`, async () => {
    await searchDialog.getSearchItemByName(groupName).ensureLoaded();
  });

  // team
  await h(t).withLog(`When I search keyword ${team.name} and click the team result`, async () => {
    await searchDialog.typeSearchKeyword(team.name);
    await searchDialog.getSearchItemByCid(team.glipId).ensureLoaded();
    await searchDialog.getSearchItemByCid(team.glipId).enter();
  });

  await h(t).withLog(`Then the conversation should be opened`, async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.groupIdShouldBe(team.glipId);
  });

  await h(t).withLog(`And Keep the search text in the search box`, async () => {
    await t.expect(searchBar.inputArea.value).eql("");
  });

  await h(t).withLog(`When I click the search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the team in recently search result`, async () => {
    await searchDialog.getSearchItemByName(team.name).ensureLoaded();
  });

  // recently search
  // people
  await h(t).withLog(`When I click the search box`, async () => {
    await searchBar.quitByPressEsc();
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then recently search result should be showed`, async () => {
    await searchDialog.shouldShowRecentlyHistory();
  });

  await h(t).withLog(`When I click the people result named "${anotherUserName}"`, async () => {
    await searchDialog.getSearchItemByName(anotherUserName).enter();
  });

  await h(t).withLog(`Then the conversation should be opened`, async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.titleShouldBe(anotherUserName);
  });

  await h(t).withLog(`And No text in the search box`, async () => {
    await t.expect(searchBar.inputArea.value).eql("");
  });

  // group
  await h(t).withLog(`When I click the search box`, async () => {
    await searchBar.quitByPressEsc();
    await searchBar.clickSelf();
  })

  await h(t).withLog(`Then recently search result should be showed`, async () => {
    await searchDialog.shouldShowRecentlyHistory();
  });

  await h(t).withLog(`When I click the group result`, async () => {
    await searchDialog.getSearchItemByName(groupName).enter();
  });

  await h(t).withLog(`Then the conversation should be opened`, async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.titleShouldBe(groupName);
  });

  await h(t).withLog(`And No text in the search box`, async () => {
    await t.expect(searchBar.inputArea.value).eql("");
  });

  // team
  await h(t).withLog(`When I click the search box`, async () => {
    await searchBar.quitByPressEsc();
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then recently search result should be showed`, async () => {
    await searchDialog.shouldShowRecentlyHistory();
  });

  await h(t).withLog(`When I click the team result`, async () => {
    await searchDialog.getSearchItemByName(team.name).enter();
  });

  await h(t).withLog(`Then the conversation should be opened`, async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.groupIdShouldBe(team.glipId);
  });

  await h(t).withLog(`And No text in the search box`, async () => {
    await t.expect(searchBar.inputArea.value).eql("");
  });
});
