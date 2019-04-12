/*
 * @Author: Potar.He 
 * @Date: 2019-04-10 12:58:57 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-04-10 14:38:33
 */
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';
import * as uuid from 'uuid';

fixture('Contact Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1570'],
  maintainers: ['potar.he'],
  keywords: ['search'],
})('Check click show more button can open search result dialog', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).glip(loginUser).init();
  const searchKeyword = await h(t).glip(loginUser).getPersonPartialData('first_name', users[5].rcId);

  const teamNames = Array(4).fill(null).map(() => `${searchKeyword} ${H.uuid()}`);
  const teams: IGroup[] = teamNames.map(name => ({
    name,
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  }));

  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  for (const team of teams) {
    await h(t).withLog(`And have a team named: ${team.name}`, async () => {
      await h(t).scenarioHelper.createTeam(team);
    });
  }

  const app = new AppRoot(t)
  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword ${searchKeyword}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(searchKeyword);
  }, true);

  await h(t).withLog(`Then I should find 3 teams on search dialog and team result header has "show more" button`, async () => {
    await t.expect(searchDialog.instantPage.teams.count).eql(3);
    await t.expect(searchDialog.instantPage.showMoreTeamsButton.exists).ok();
  });

  await h(t).withLog(`When I click 'Show more' button`, async () => {
    await searchDialog.instantPage.clickShowMoreTeams();
  });

  await h(t).withLog(`Then search result team tab should be open`, async () => {
    await searchDialog.fullSearchPage.teamsTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display more data`, async () => {
    await t.expect(searchDialog.fullSearchPage.items.count).gte(4);
  });
})


test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1562'],
  maintainers: ['potar.he'],
  keywords: ['search'],
})('Check can search for messages in the search result dialog', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  await h(t).glip(loginUser).init();

  const teamNames = Array(2).fill(null).map(() => `${uuid()}`);
  const teams: IGroup[] = teamNames.map(name => ({
    name,
    type: 'Team',
    owner: loginUser,
    members: [loginUser, anotherUser],
  }));


  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);
  let postPool: string[][] = []
  for (const team of teams) {
    await h(t).withLog(`And have a team named: ${team.name}`, async () => {
      await h(t).scenarioHelper.createTeam(team);
    });

    await h(t).withLog(`And each member send post text ${team.name}`, async () => {
      let postIds: string[] = []
      for (const user of team.members) {
        postIds.unshift(await h(t).scenarioHelper.sentAndGetTextPostId(team.name, team, user));
      }
      postPool.push(postIds)
    });
  }

  const app = new AppRoot(t)
  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I open team "${teamNames[0]}" and search keyword ${teamNames[0]}`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teams[0].glipId).enter();
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(teamNames[0]);
  }, true);

  await h(t).withLog(`And click search content in this conversation item`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then search result message tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display ${postPool[0].length}`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).eql(postPool[0].length);
  });

  // todo: filter

  

  // switch other tab
  await h(t).withLog(`When I switch to people tab`, async () => {
    await searchDialog.fullSearchPage.groupsTabEntry.enter();
  }, true);

  await h(t).withLog(`Then there is no results in the tab`, async () => {
    await t.expect(searchDialog.fullSearchPage.items.count).eql(0);
  });

  await h(t).withLog(`When I switch to group tab`, async () => {
    await searchDialog.fullSearchPage.groupsTabEntry.enter();
  }, true);

  await h(t).withLog(`Then there is no results in the tab`, async () => {
    await t.expect(searchDialog.fullSearchPage.items.count).eql(0);
  });


  await h(t).withLog(`When I switch to teams tab`, async () => {
    await searchDialog.fullSearchPage.teamsTabEntry.enter();
  }, true);


  await h(t).withLog(`Then there is one teams named ${teamNames[0]}`, async () => {
    await searchDialog.fullSearchPage.conversationsContainName(teamNames[0]);
  });

  // change search keyword
  await h(t).withLog(`When I search by keyword ${teamNames[1]}`, async () => {
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(teamNames[0]);
  }, true);

  await h(t).withLog(`And click search content item (global)`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then search result message tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display search result count at least ${postPool[1].length}`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(postPool[1].length);
    await t.expect(searchDialog.fullSearchPage.searchResultsCount.exists).ok();
    await searchDialog.fullSearchPage.countOnHeaderGreaterThanOrEqual(postPool[1].length)
  });

  let postId, groupId;
  await h(t).withLog(`When I hover a item and click jump to conversation button`, async () => {
    const postItem = searchDialog.fullSearchPage.messagesTab.nthPostItem(0);
    postId = await postItem.postId;
    groupId = await postItem.conversationSourceId;
    await postItem.hoverPostAndClickJumpToConversationButton();
  }, true);

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And it should open the conversation and highlight the post in the conversation`, async () => {
    await conversationPage.groupIdShouldBe(groupId);
    await conversationPage.postItemById(postId).shouldBeHighLight();
  });

  await h(t).withLog(`And no text in the search box`, async () => {
    await searchDialog.ensureDismiss();
    await searchBar.searchTextShouldBe('');
  });
})