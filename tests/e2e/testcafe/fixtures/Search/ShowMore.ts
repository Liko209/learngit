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
import * as _ from 'lodash';

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
  const loginUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', loginUser.rcId);

  const firstTeamName = uuid();
  const secondTeamName = uuid();

  let firstTeam = <IGroup>{
    name: firstTeamName,
    type: 'Team',
    owner: loginUser,
    members: [loginUser, anotherUser],
  }
  let secondTeam = <IGroup>{
    name: secondTeamName,
    type: 'Team',
    owner: loginUser,
    members: [loginUser, anotherUser],
  }

  await h(t).withLog(`Given have a team named: ${firstTeamName}`, async () => {
    await h(t).scenarioHelper.createTeam(firstTeam);
  });

  await h(t).withLog(`And have a team named: ${secondTeamName}`, async () => {
    await h(t).scenarioHelper.createTeam(secondTeam);
  });



  await h(t).withLog(`And make some posts in both team `, async () => {
    await h(t).scenarioHelper.sentAndGetTextPostId(firstTeamName, firstTeam, loginUser);
    await h(t).scenarioHelper.sentAndGetTextPostId(firstTeamName, firstTeam, anotherUser);

    await h(t).scenarioHelper.sentAndGetTextPostId(firstTeamName, secondTeam, loginUser);
    await h(t).scenarioHelper.sentAndGetTextPostId(secondTeamName, secondTeam, anotherUser);
  });

  const app = new AppRoot(t)
  await h(t).withLog(`And I login with the extension ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const firstTeamNameWithLink = `http://${firstTeamName}.com`;

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I open team "${firstTeamName}" and send a link by teamName`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(firstTeam.glipId).enter();
    await conversationPage.sendMessage(firstTeamNameWithLink);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  }, true);

  await h(t).withLog(`And I search by the team name as keyword `, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(firstTeamName);
  }, true)

  await h(t).withLog(`And click search content in this conversation item`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then search result message tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messagesTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display 3 posts`, async () => {
    await searchDialog.fullSearchPage.countOnHeaderGreaterThanOrEqual(3);
    await t.expect(messagesTab.posts.count).eql(3);
  });

  // Filter
  await h(t).withLog(`When I set filter post by ${loginUserName}`, async () => {
    await messagesTab.postByField.typeText(loginUserName);
    await messagesTab.postByField.selectMemberByNth(0);
  }, true);

  await h(t).withLog(`Then only remain posts by the user`, async () => {
    await messagesTab.allPostShouldBeByUser(loginUserName);
  });

  await h(t).withLog(`When I clear post by field`, async () => {
    await messagesTab.postByField.removeSelectedItem(-1);
  }, true);

  await h(t).withLog(`Then should display 3 posts`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).eql(3, { timeout: 20e3 });
  });

  await h(t).withLog(`When I clear post in filed`, async () => {
    await messagesTab.postInField.removeSelectedItem(-1);
  }, true);

  await h(t).withLog(`Then should display 4 posts`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).eql(4, { timeout: 30e3 });
  });

  await h(t).withLog(`When I select type option of links `, async () => {
    await messagesTab.openTypeOptions();
    await messagesTab.selectTypeOfLinks();
  }, true);

  await h(t).withLog(`Then should display 1 posts`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).eql(1);
  });


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

  await h(t).withLog(`Then there is one teams named ${firstTeamName}`, async () => {
    await searchDialog.fullSearchPage.conversationsContainName(firstTeamName);
  });

  // change search keyword
  await h(t).withLog(`When I search by keyword ${secondTeamName}`, async () => {
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(secondTeamName);
  }, true);

  await h(t).withLog(`And click search content item (global)`, async () => {
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
  });

  await h(t).withLog(`Then search result message tab should be opened`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display search result count at least 1`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await t.expect(searchDialog.fullSearchPage.searchResultsCount.exists).ok();
    await searchDialog.fullSearchPage.countOnHeaderGreaterThanOrEqual(1);
  });

  let postId, groupId;
  await h(t).withLog(`When I hover a item and click jump to conversation button`, async () => {
    const postItem = searchDialog.fullSearchPage.messagesTab.nthPostItem(0);
    postId = await postItem.postId;
    groupId = await postItem.conversationSourceId;
    await postItem.hoverPostAndClickJumpToConversationButton();
  }, true);

  await h(t).withLog(`And it should open the conversation and highlight the post in the conversation`, async () => {
    await conversationPage.groupIdShouldBe(groupId);
    await conversationPage.postItemById(postId).shouldBeHighLight();
  });

  await h(t).withLog(`And no text in the search box`, async () => {
    await searchDialog.ensureDismiss();
    await searchBar.searchTextShouldBe('');
  });
})