/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2019-02-12 15:37:30
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';

fixture('Contact Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Search result should be updated in real time when team privacy is changed', ['JPT-1067', 'P1', 'Search', 'henry.xu']), async (t) => {
  const me = h(t).rcData.mainCompany.users[5];
  const anotherUser = h(t).rcData.mainCompany.users[6];

  // teams should share same search keyword so that search result will only be subset of those team
  const searchKeyword = `Team-${H.uuid()}`;
  let publicTeamWithoutMe = <IGroup>{
    type: 'Team', isPublic: true,
    name: `${searchKeyword} PublicTeamWithoutMe`,
    owner: anotherUser,
    members: [anotherUser],
  };
  let publicTeamWithMe = <IGroup>{
    type: 'Team', isPublic: true,
    name: `${searchKeyword} PublicTeamWithMe`,
    owner: anotherUser,
    members: [me, anotherUser],
  };
  let privateTeamWithoutMe = <IGroup>{
    type: 'Team', isPublic: false,
    name: `${searchKeyword} PrivateTeamWithoutMe`,
    owner: anotherUser,
    members: [anotherUser],
  };
  let privateTeamWithMe = <IGroup>{
    type: 'Team', isPublic: false,
    name: `${searchKeyword} PrivateTeamWithMe`,
    owner: anotherUser,
    members: [me, anotherUser],
  };

  // background: get an account and prepare teams
  await h(t).log(`Given I have an extension "${me.company.number}#${me.extension}"`);
  for (const team of [publicTeamWithMe, publicTeamWithoutMe, privateTeamWithMe, privateTeamWithoutMe]) {
    await h(t).withLog(`And there is a team named "${team.name}"`, async () => {
      await h(t).scenarioHelper.createTeam(team);
    });
  }

  // scripts start from here
  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  let searchResults: IGroup[];
  const searchBar = app.homePage.header.search;
  await h(t).withLog(`And search with keyword "${searchKeyword}"`, async () => {
    await searchBar.typeSearchKeyword(searchKeyword);
  });

  // assertion
  searchResults = [publicTeamWithMe, publicTeamWithoutMe, privateTeamWithMe];
  await h(t).withLog(`Then I should find following teams in search result: ${groupsToString(searchResults)}`, async () => {
    await t.expect(searchBar.teams.count).gte(searchResults.length, { timeout: 10e3 });
    for (const team of searchResults) {
      await searchBar.dropDownListShouldContainTeam(team);
    }
  }, true);

  await h(t).withLog(`And team "${privateTeamWithMe.name}" should labeled as private`, async () => {
    await searchBar.getSearchItemByCid(privateTeamWithMe.glipId).shouldHavePrivateLabel();
  });

  await h(t).withLog(`And team "${publicTeamWithMe.name}" should have a joined label`, async () => {
    await searchBar.getSearchItemByCid(publicTeamWithMe.glipId).shouldHaveJoinedLabel();
  });

  // update configuration of teams
  const teamsBecomePrivate = [publicTeamWithMe, publicTeamWithoutMe];
  await h(t).withLog(`When teams ${groupsToString(teamsBecomePrivate)} become private`, async () => {
    for (const team of teamsBecomePrivate) {
      await h(t).scenarioHelper.updateTeam(team, { isPublic: false });
    }
  });

  const teamsBecomePublic = [privateTeamWithMe, privateTeamWithoutMe];
  await h(t).withLog(`And teams ${groupsToString(teamsBecomePublic)} become public`, async () => {
    for (const team of teamsBecomePublic) {
      await h(t).scenarioHelper.updateTeam(team, { isPublic: true });
    }
  });

  // swap to keep consistency with current state
  [publicTeamWithMe, publicTeamWithoutMe, privateTeamWithMe, privateTeamWithoutMe] =
    [privateTeamWithMe, privateTeamWithoutMe, publicTeamWithMe, publicTeamWithoutMe];

  // Note
  // Here you will find that when PrivateTeamWithoutMe become PublicTeamWithoutMe, it won't be showed in test result.
  // This is by design due to technical limitation. You have to type keyword again in search input to trigger search result update.
  // Thus here only 2 items in result list.

  // assertion
  searchResults = [publicTeamWithMe, privateTeamWithMe];
  await h(t).withLog(`Then I should find following teams in search result: ${groupsToString(searchResults)}`, async () => {
    await t.expect(searchBar.teams.count).gte(searchResults.length, { timeout: 10e3 });
    for (const team of searchResults) {
      await searchBar.dropDownListShouldContainTeam(team);
    }
  }, true);

  await h(t).withLog(`And team "${privateTeamWithMe.name}" should labeled as private`, async () => {
    await searchBar.getSearchItemByCid(privateTeamWithMe.glipId).shouldHavePrivateLabel();
  });

  await h(t).withLog(`And team "${publicTeamWithMe.name}" should have a joined label`, async () => {
    await searchBar.getSearchItemByCid(publicTeamWithMe.glipId).shouldHaveJoinedLabel();
  });

});


test(formalName('Search result should be updated in real time when team membership is changed', ['JPT-1119', 'P1', 'Search', 'henry.xu']), async (t) => {
  const me = h(t).rcData.mainCompany.users[5];
  const anotherUser = h(t).rcData.mainCompany.users[6];

  // teams should share same search keyword so that search result will only be subset of those team
  const searchKeyword = `Team-${H.uuid()}`;
  let publicTeamWithoutMe = <IGroup>{
    type: 'Team', isPublic: true,
    name: `${searchKeyword} PublicTeamWithoutMe`,
    owner: anotherUser,
    members: [anotherUser],
  };
  let publicTeamWithMe = <IGroup>{
    type: 'Team', isPublic: true,
    name: `${searchKeyword} PublicTeamWithMe`,
    owner: anotherUser,
    members: [me, anotherUser],
  };
  let privateTeamWithoutMe = <IGroup>{
    type: 'Team', isPublic: false,
    name: `${searchKeyword} PrivateTeamWithoutMe`,
    owner: anotherUser,
    members: [anotherUser],
  };
  let privateTeamWithMe = <IGroup>{
    type: 'Team', isPublic: false,
    name: `${searchKeyword} PrivateTeamWithMe`,
    owner: anotherUser,
    members: [me, anotherUser],
  };

  // background: get an account and prepare teams
  await h(t).log(`Given I have an extension "${me.company.number}#${me.extension}"`);
  for (const team of [publicTeamWithMe, publicTeamWithoutMe, privateTeamWithMe, privateTeamWithoutMe]) {
    await h(t).withLog(`And there is a team named "${team.name}"`, async () => {
      await h(t).scenarioHelper.createTeam(team);
    });
  }

  // scripts start from here
  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  let searchResults: IGroup[];
  const searchBar = app.homePage.header.search;
  await h(t).withLog(`And search with keyword "${searchKeyword}"`, async () => {
    await searchBar.typeSearchKeyword(searchKeyword);
  });

  // assertion
  searchResults = [publicTeamWithMe, publicTeamWithoutMe, privateTeamWithMe];
  await h(t).withLog(`Then I should find following teams in search result: ${groupsToString(searchResults)}`, async () => {
    await t.expect(searchBar.teams.count).gte(searchResults.length, { timeout: 10e3 });
    for (const team of searchResults) {
      await searchBar.dropDownListShouldContainTeam(team);
    }
  }, true);

  await h(t).withLog(`And team "${privateTeamWithMe.name}" should labeled as private`, async () => {
    await searchBar.getSearchItemByCid(privateTeamWithMe.glipId).shouldHavePrivateLabel();
  });

  await h(t).withLog(`And team "${publicTeamWithMe.name}" should have a joined label`, async () => {
    await searchBar.getSearchItemByCid(publicTeamWithMe.glipId).shouldHaveJoinedLabel();
  });

  // update configuration of teams
  const teamsToBeRemovedFrom = [publicTeamWithMe, privateTeamWithMe];
  await h(t).withLog(`And be removed from teams ${groupsToString(teamsToBeRemovedFrom)}`, async () => {
    for (const team of teamsToBeRemovedFrom) {
      await h(t).scenarioHelper.removeMemberFromTeam(team, [me]);
    }
  });

  const teamsToBeAddedTo = [publicTeamWithoutMe, privateTeamWithoutMe];
  await h(t).withLog(`And be added to teams ${groupsToString(teamsToBeAddedTo)}`, async () => {
    for (const team of teamsToBeAddedTo) {
      await h(t).scenarioHelper.addMemberToTeam(team, [me]);
    }
  });

  // swap to keep consistency with current state
  [publicTeamWithMe, publicTeamWithoutMe, privateTeamWithMe, privateTeamWithoutMe] =
    [publicTeamWithoutMe, publicTeamWithMe, privateTeamWithoutMe, privateTeamWithMe];

  // Note
  // Here you will find that when PrivateTeamWithoutMe become PrivateTeamWithMe, it won't be showed in test result.
  // This is by design due to technical limitation. You have to type keyword again in search input to trigger search result update.
  // Thus here only 2 items in result list.

  // assertion
  searchResults = [publicTeamWithMe, publicTeamWithoutMe];
  await h(t).withLog(`Then I should find following teams in search result: ${groupsToString(searchResults)}`, async () => {
    await t.expect(searchBar.teams.count).gte(searchResults.length, { timeout: 10e3 });
    for (const team of searchResults) {
      await searchBar.dropDownListShouldContainTeam(team);
    }
  }, true);

  await h(t).withLog(`And team "${publicTeamWithMe.name}" should have a joined label`, async () => {
    await searchBar.getSearchItemByCid(publicTeamWithMe.glipId).shouldHaveJoinedLabel();
  });
});


function groupsToString(groups: IGroup[]): string {
  return groups.map(group => group.name).join(',');
}
