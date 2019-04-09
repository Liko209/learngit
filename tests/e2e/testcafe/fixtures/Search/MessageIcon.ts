/*
 * @Author: Potar.He
 * @Date: 2019-03-01 10:44:59
 * @Last Modified by: isaac.liu
 * @Last Modified time: 2019-03-22 16:06:54
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


test(formalName('Check can open conversation when click message icon in the search list', ['P1', 'JPT-1223', 'Icon', 'Search', 'Potar.He']), async (t) => {
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
    isPublic: true,
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

  const searchBar = app.homePage.header.searchBar;


  const iconResults = [{
    keyword: anotherUserName,
    item: searchBar.nthPeople(0),
    position: "the first people result"
  }, {
    keyword: anotherUserName,
    item: searchBar.nthGroup(0),
    position: "the first groups result"
  }, {
    keyword: teamWithMe.name,
    item: searchBar.getSearchItemByName(teamWithMe.name),
    position: "the team which I joined"
  }];

  let namesHaveMessageIcon = [];

  // search result with message icon
  for (const result of iconResults) {
    let title;
    await h(t).withLog(`When I search keyword ${result.keyword} and hover ${result.position}`, async () => {
      await searchBar.clickInputArea();
      await searchBar.typeSearchKeyword(result.keyword);
      await t.expect(result.item.exists).ok();
      title = await result.item.getName();
      namesHaveMessageIcon.push(title);
      await t.hover(result.item.self);
    });

    await h(t).withLog(`Then display the message icon in the result`, async () => {
      await t.expect(result.item.messageButton.exists).ok();
    });

    await h(t).withLog(`When I click the message icon`, async () => {
      await result.item.clickMessageButton();
    });

    await h(t).withLog(`Then the conversation of the result should be opened`, async () => {
      await app.homePage.messageTab.conversationPage.titleShouldBe(title);
    });

    await h(t).withLog(`And the search text should be clear`, async () => {
      await t.expect(searchBar.inputArea.value).eql('');
    });
  }

  // join button via search
  await h(t).withLog(`When I search keyword ${publicTeamWithOutMe.name} and hover the team which I did not join`, async () => {
    await searchBar.clickInputArea();
    await searchBar.typeSearchKeyword(publicTeamWithOutMe.name);
    await t.expect(searchBar.getSearchItemByName(publicTeamWithOutMe.name).exists).ok();
    await t.hover(searchBar.getSearchItemByName(publicTeamWithOutMe.name).self);
  });

  await h(t).withLog(`Then display the the join button in the result`, async () => {
    await searchBar.getSearchItemByName(publicTeamWithOutMe.name).shouldHaveJoinButton();
  });

  await h(t).withLog(`When I click the result ${publicTeamWithOutMe.name}`, async () => {
    await searchBar.getSearchItemByName(publicTeamWithOutMe.name).enter();
  });

  const joinTeamDialog = app.homePage.joinTeamDialog;
  await h(t).withLog(`Then the team join dialog should be popup`, async () => {
    // FIJI-4360 temp solution
    // await app.homePage.profileDialog.shouldBePopUp();
    // await app.homePage.profileDialog.clickCloseButton();
    // await searchBar.clearInputAreaText();
    await joinTeamDialog.ensureLoaded();
    await joinTeamDialog.cancel();
  });

  // message icon on recently history
  for (const title of namesHaveMessageIcon) {
    await h(t).withLog(`When I click search box`, async () => {
      await searchBar.clickInputArea();
    });

    await h(t).withLog(`Then display recently search result`, async () => {
      await searchBar.shouldShowRecentlyHistory();
      await t.expect(searchBar.getSearchItemByName(title).exists).ok();
    });

    await h(t).withLog(`When I hove the result named: ${title}`, async () => {
      await t.hover(searchBar.getSearchItemByName(title).self);
    });

    await h(t).withLog(`Then message icon should be showed`, async () => {
      await t.expect(searchBar.getSearchItemByName(title).messageButton.exists).ok();
    });

    await h(t).withLog(`When I click the message icon`, async () => {
      await searchBar.getSearchItemByName(title).clickMessageButton();
    });

    await h(t).withLog(`Then the conversation of the result should be opened`, async () => {
      await app.homePage.messageTab.conversationPage.titleShouldBe(title);
    });

    await h(t).withLog(`And the search text should be clear`, async () => {
      await t.expect(searchBar.inputArea.value).eql('');
    });
  }

  // join button via recently history
  await h(t).withLog(`When I clear search box and  click search box`, async () => {
    await searchBar.clearInputAreaText();
    await searchBar.clickInputArea();
    await searchBar.shouldShowRecentlyHistory();
    await t.expect(searchBar.getSearchItemByName(publicTeamWithOutMe.name).exists).ok();
    await t.hover(searchBar.getSearchItemByName(publicTeamWithOutMe.name).self);
  });

  await h(t).withLog(`Then the recently history should has ${publicTeamWithOutMe.name}`, async () => {
    await searchBar.shouldShowRecentlyHistory();
    await t.expect(searchBar.getSearchItemByName(publicTeamWithOutMe.name).exists).ok();
    await t.hover(searchBar.getSearchItemByName(publicTeamWithOutMe.name).self);
  });

  await h(t).withLog(`When I hover the team  ${publicTeamWithOutMe.name} which I did not join`, async () => {
    await t.hover(searchBar.getSearchItemByName(publicTeamWithOutMe.name).self);
  });

  await h(t).withLog(`Then display the the join button in the result`, async () => {
    await searchBar.getSearchItemByName(publicTeamWithOutMe.name).shouldHaveJoinButton();
  });

  await h(t).withLog(`And the search text should be clear`, async () => {
    await t.expect(searchBar.inputArea.value).eql('');
  });

});
