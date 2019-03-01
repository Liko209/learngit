/*
 * @Author: Potar.He 
 * @Date: 2019-03-01 10:44:59 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-01 10:46:36
 */
import { v4 as uuid } from 'uuid';
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

  await h(t).withLog(`And with a team named: ${team.name} and a group`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team, group]);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.search;

  // person
  await h(t).withLog(`When I search keyword ${anotherUserName} and click the first people result`, async () => {
    await searchBar.typeSearchKeyword(anotherUserName);
    await t.expect(searchBar.peoples.count).gte(1);
    await searchBar.nthPeople(0).enter();
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog(`Then Profile dialog should be popup and search result should be closed`, async () => {
    await profileDialog.shouldBePopUp();
    await t.expect(searchBar.allResultItems.exists).notOk();
  });

  await h(t).withLog(`When I close the profile dialog`, async () => {
    await profileDialog.close();
  });

  await h(t).withLog(`Then Keep the search text in the search box`, async () => {
    await t.expect(searchBar.inputArea.value).eql(anotherUserName);
  });

  await h(t).withLog(`When I click the search box`, async () => {
    await profileDialog.close();
  });

  await h(t).withLog(`Then display instant search`, async () => {
    await t.expect(searchBar.peoples.count).gte(1);
  });

  // group
  await h(t).withLog(`When I search keyword ${anotherUserName} and click the first group result`, async () => {
    await searchBar.typeSearchKeyword(anotherUserName);
    await t.expect(searchBar.groups.count).gte(1);
    await searchBar.nthGroup(0).enter();
  });

  await h(t).withLog(`Then Profile dialog should be popup and search result should be closed`, async () => {
    await profileDialog.shouldBePopUp();
    await t.expect(searchBar.allResultItems.exists).notOk();
  });

  await h(t).withLog(`When I close the profile dialog`, async () => {
    await profileDialog.close();
  });

  await h(t).withLog(`Then Keep the search text in the search box`, async () => {
    await t.expect(searchBar.inputArea.value).eql(anotherUserName);
  });

  await h(t).withLog(`When I click the search box`, async () => {
    await profileDialog.close();
  });

  await h(t).withLog(`Then display instant search`, async () => {
    await t.expect(searchBar.groups.count).gte(1);
  });

  // team 
  await h(t).withLog(`When I search keyword ${team.name} and click the first team result`, async () => {
    await searchBar.typeSearchKeyword(anotherUserName);
    await t.expect(searchBar.teams.count).gte(1);
    await searchBar.nthTeam(0).enter();
  });

  await h(t).withLog(`Then Profile dialog should be popup and search result should be closed`, async () => {
    await profileDialog.shouldBePopUp();
    await t.expect(searchBar.allResultItems.exists).notOk();
  });

  await h(t).withLog(`When I close the profile dialog`, async () => {
    await profileDialog.close();
  });

  await h(t).withLog(`Then Keep the search text in the search box`, async () => {
    await t.expect(searchBar.inputArea.value).eql(anotherUserName);
  });

  await h(t).withLog(`When I click the search box`, async () => {
    await profileDialog.close();
  });

  await h(t).withLog(`Then display instant search`, async () => {
    await t.expect(searchBar.teams.count).gte(1);
  });

  // TODO: recently search 

});