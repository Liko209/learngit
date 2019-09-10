/*
 * @Author: Potar.He
 * @Date: 2019-03-01 10:44:59
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-04-09 15:48:21
 */
import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';

fixture('Search/Icon')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1223'],
  maintainers: ['potar.he'],
  keywords: ['search', 'Icon'],
})('Check can open conversation when click message icon in the search list', async (t) => {
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

  const searchDialog = app.homePage.searchDialog;


  const iconResults = [{
    keyword: anotherUserName,
    item: searchDialog.instantPage.nthPeople(0),
    position: "the first people result"
  }, {
    keyword: anotherUserName,
    item: searchDialog.instantPage.nthGroup(0),
    position: "the first groups result"
  }, {
    keyword: teamWithMe.name,
    item: searchDialog.instantPage.conversationEntryByCid(teamWithMe.glipId),
    position: "the team which I joined"
  }];

  let namesHaveMessageIcon = [];

  // search result with message icon
  const searchBar = app.homePage.header.searchBar;
  for (const result of iconResults) {
    let title;
    await h(t).withLog(`When I search keyword ${result.keyword} and hover ${result.position}`, async () => {
      await searchBar.clickSelf();
      await searchDialog.typeSearchKeyword(result.keyword);
      await t.expect(result.item.exists).ok();
      title = await result.item.getName();
      namesHaveMessageIcon.push(title);
      await t.hover(result.item.self);
    });

    await h(t).withLog(`Then display the message icon in the result`, async () => {
      await t.expect(result.item.messageButton.exists).ok();
    });

    await h(t).withLog(`When I click the message icon`, async () => {
      await result.item.hoverAndClickMessageButton();
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
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(publicTeamWithOutMe.name);
    await t.expect(searchDialog.instantPage.conversationEntryByCid(publicTeamWithOutMe.glipId).exists).ok();
    await t.hover(searchDialog.instantPage.conversationEntryByCid(publicTeamWithOutMe.glipId).self);
  });

  await h(t).withLog(`Then display the the join button in the result`, async () => {
    await searchDialog.instantPage.conversationEntryByCid(publicTeamWithOutMe.glipId).shouldHaveJoinButton();
  });

  await h(t).withLog(`When I click the result ${publicTeamWithOutMe.name}`, async () => {
    await searchDialog.instantPage.conversationEntryByCid(publicTeamWithOutMe.glipId).enter();
  });

  const joinTeamDialog = app.homePage.joinTeamDialog;
  await h(t).withLog(`Then the team join dialog should be popup`, async () => {
    await joinTeamDialog.ensureLoaded();
    await joinTeamDialog.clickCancelButton();
  });

  // message icon on recently history
  for (const name of namesHaveMessageIcon) {
    await h(t).withLog(`When I click search box`, async () => {
      await searchBar.clickInputArea();
    });

    await h(t).withLog(`Then display recently search result`, async () => {
      await searchDialog.recentPage.ensureLoaded();
      await t.expect(searchDialog.recentPage.conversationByName(name).exists).ok();
    });

    await h(t).withLog(`When I hove the result named: ${name}`, async () => {
      await t.hover(searchDialog.recentPage.conversationByName(name).self);
    });

    await h(t).withLog(`Then message icon should be showed`, async () => {
      await t.expect(searchDialog.recentPage.conversationByName(name).messageButton.exists).ok();
    });

    await h(t).withLog(`When I click the message icon`, async () => {
      await searchDialog.recentPage.conversationByName(name).hoverAndClickMessageButton();
    });

    await h(t).withLog(`Then the conversation of the result should be opened`, async () => {
      await app.homePage.messageTab.conversationPage.titleShouldBe(name);
    });

    await h(t).withLog(`And the search text should be clear`, async () => {
      await t.expect(searchBar.inputArea.value).eql('');
    });
  }

  // join button via recently history
  await h(t).withLog(`When I click search box`, async () => {
    await searchBar.clickSelf();
  });

  await h(t).withLog(`Then the recently history should has ${publicTeamWithOutMe.name}`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.conversationByName(publicTeamWithOutMe.name).exists).ok();
    await t.hover(searchDialog.recentPage.conversationByName(publicTeamWithOutMe.name).self);
  });

  await h(t).withLog(`When I hover the team  ${publicTeamWithOutMe.name} which I did not join`, async () => {
    await t.hover(searchDialog.recentPage.conversationByName(publicTeamWithOutMe.name).self);
  });

  await h(t).withLog(`Then display the the join button in the result`, async () => {
    await searchDialog.recentPage.conversationByName(publicTeamWithOutMe.name).shouldHaveJoinButton();
  });

  await h(t).withLog(`And the search text should be clear`, async () => {
    await t.expect(searchBar.inputArea.value).eql('');
  });
});
