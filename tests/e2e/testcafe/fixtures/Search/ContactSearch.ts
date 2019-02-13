/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2019-02-12 15:37:30
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { SITE_URL, BrandTire, SITE_ENV } from '../../config';


fixture('Contact Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check search result will change when changing a team to public/private or join/not join a team', ['JPT-1067', 'P1', 'Search', 'henry.xu']), async (t) => {
  const me = h(t).rcData.mainCompany.users[5];
  const anotherUser = h(t).rcData.mainCompany.users[6];

  // teams should share same search keyword so that we can just
  const searchKeyword = `Team-${uuid()}`;
  const publicTeamWithoutMe = <IGroup>{
    privacy: 'protected', isPublic: true, type: 'Team',
    name: `${searchKeyword} PublicTeamWithoutMe`,
    owner: anotherUser,
    members: [anotherUser],
  };
  const publicTeamWithMe = <IGroup>{
    privacy: 'protected', isPublic: true, type: 'Team',
    name: `${searchKeyword} PublicTeamWithMe`,
    owner: anotherUser,
    members: [me, anotherUser],
  };
  const privateTeamWithoutMe = <IGroup>{
    privacy: 'private', isPublic: false, type: 'Team',
    name: `${searchKeyword} PrivateTeamWithoutMe`,
    owner: anotherUser,
    members: [anotherUser],
  };
  const privateTeamWithMe = <IGroup>{
    privacy: 'private', isPublic: false, type: 'Team',
    name: `${searchKeyword} PrivateTeamWithMe`,
    owner: anotherUser,
    members: [me, anotherUser],
  };

  // background
  await h(t).log(`Given I have an extension "${me.company.number}#${me.extension}"`);
  for (const team of [publicTeamWithMe, publicTeamWithoutMe, privateTeamWithMe, privateTeamWithoutMe]) {
    await h(t).withLog(`And there is a team named"${team.name}"`, async () => {
      await h(t).scenarioHelper.createGroup(team);
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

  searchResults = [publicTeamWithMe, publicTeamWithoutMe, privateTeamWithMe];
  await h(t).withLog(`Then I should find following teams in search result: ${groupsToString(searchResults)}`, async () => {
    for (const team of searchResults) {
      await searchBar.dropDownListShouldContainTeam(team);
    }
  }, true);

  await h(t).withLog(`And team "${privateTeamWithMe.name}" should labeled as private`, async () => {
    await searchBar.getSearchItemByCid(privateTeamWithMe.glipId).shouldHasPrivateLabel();
  });

  await h(t).withLog(`And team "${publicTeamWithoutMe.name}" should has a join button`, async () => {
    await searchBar.getSearchItemByCid(publicTeamWithoutMe.glipId).shouldHasJoinButton();
  });

  const teamsBecomePrivate = [publicTeamWithMe, publicTeamWithoutMe];
  await h(t).withLog(`When teams ${groupsToString(teamsBecomePrivate)} become private`, async () => {


  });

  const teamsBecomePublic = [privateTeamWithMe, privateTeamWithoutMe];
  await h(t).withLog(`And teams ${groupsToString(teamsBecomePublic)} become public`, async () => {

  });


  searchResults = [privateTeamWithMe, privateTeamWithoutMe,]
  await h(t).withLog(`Then I should find following teams in search result`, async () => {

  });


});


function groupsToString(groups: IGroup[]): string {
  return groups.map(group => group.name).join(',');
}
