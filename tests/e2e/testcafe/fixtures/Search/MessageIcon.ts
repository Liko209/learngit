/*
 * @Author: Potar.He 
 * @Date: 2019-03-01 10:44:59 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-01 13:02:11
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';

fixture('Search/Icon')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Check can open conversation when click message icon in the search list', ['P1', 'JPT-1213', 'Icon', 'Search', 'Potar.He']), async (t) => {
  const me = h(t).rcData.mainCompany.users[5];
  const anotherUser = h(t).rcData.mainCompany.users[6];
  await h(t).glip(me).init();
  const anotherUserName = await h(t).glip(me).getPersonPartialData('display_name', anotherUser.rcId);

  let teamWithMe = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: me,
    members: [me],
  };
  let publicTeamWithOutMe = <IGroup>{
    type: 'Team',
    isPublic: false,
    name: uuid(),
    owner: anotherUser,
    members: [anotherUser],
  }
  let group = <IGroup>{
    type: 'DirectMessage',
    owner: me,
    members: [me, anotherUser, h(t).rcData.mainCompany.users[7]],
  };

  await h(t).log(`Given I have an extension "${me.company.number}#${me.extension}"`);

  await h(t).withLog(`And with two team and a group`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([teamWithMe, publicTeamWithOutMe, group]);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.search;

  let conversationId: string;
  const iconResults = [{
    keyword: anotherUserName,
    item: searchBar.nthPeople(0),
    position: "the first people result"
  }, {
    keyword: anotherUserName,
    item: searchBar.nthGroup(0),
    section: "the first groups result"
  }, {
    keyword: teamWithMe.name,
    item: searchBar.getSearchItemByName(teamWithMe.name),
    section: "the team which I joined"
  }]

  for (const result of iconResults) {
    await h(t).withLog(`When I search keyword ${result.keyword} and hover ${result.position}`, async () => {
      await searchBar.typeSearchKeyword(result.keyword);
      await t.expect(result.item.exists).ok();
      await t.hover(result.item.self);
    });

    await h(t).withLog(`Then display the message icon in the result`, async () => {
      // todo
    });

    await h(t).withLog(`When I click the message icon`, async () => {
      // todo
    });

    await h(t).withLog(`Then the conversation of the result should be opened`, async () => {
      await app.homePage.messageTab.conversationPage.groupIdShouldBe(conversationId);
    });

    await h(t).withLog(`And the search text should be clear`, async () => {
      await t.expect(searchBar.inputArea.value).eql('');
    });
  }

  // join button
  await h(t).withLog(`When I search keyword ${publicTeamWithOutMe.name} and hover the team which I did not join`, async () => {
    await searchBar.typeSearchKeyword(publicTeamWithOutMe.name);
    await t.expect(searchBar.getSearchItemByName(publicTeamWithOutMe.name).exists).ok();
    await t.hover(searchBar.getSearchItemByName(publicTeamWithOutMe.name).self);
  });

  await h(t).withLog(`Then display the the join button in the result`, async () => {
    await searchBar.getSearchItemByName(publicTeamWithOutMe.name).shouldHaveJoinButton(); 
  });

  // TODO: recently search 

});