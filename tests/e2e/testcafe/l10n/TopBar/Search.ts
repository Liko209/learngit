import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { v4 as uuid } from "uuid"

fixture('TopBar/Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase())
test(formalName('Check menu tip', ['P2', 'Search', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[6];
  const otherUser = h(t).rcData.mainCompany.users[5];
  const anotherUser = h(t).rcData.mainCompany.users[7];
  const searchDialog = app.homePage.searchDialog;
  const group: IGroup = {
    type: 'group',
    owner: loginUser,
    members: [loginUser, otherUser, anotherUser],
  }
  const PublicTeamWithoutMe: IGroup = {
    name: `hPublicTeamWithoutMe ${uuid()}`,
    type: 'Team', isPublic: true,
    owner: anotherUser,
    members: [otherUser, anotherUser],
  }
  const teamsNames = Array(3).fill(null).map(() => "h" + uuid())
  const teams: IGroup[] = teamsNames.map(name => ({
    name,
    type: 'Team', isPublic: true,
    owner: loginUser,
    members: [loginUser, otherUser, anotherUser],
  }));
  const iconResults = [{
    keyword: "@!#$",
    item: searchDialog.instantPage.nthConversation(0),
    position: "the first conversation result"
  }, {
    keyword: anotherUser.extension,
    item: searchDialog.instantPage.nthGroup(0),
    position: "the first groups result"
  }, {
    keyword: PublicTeamWithoutMe.name,
    item: searchDialog.instantPage.nthTeam(0),
    position: "the team which without me"
  }];
  const anotherUserExtension = iconResults[1].keyword

  await h(t).glip(loginUser).init();

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog(`Given I have a team without me"`, async () => {
    await h(t).scenarioHelper.createTeam(PublicTeamWithoutMe);
  });
  await h(t).withLog(`Given I have five teams named "${teamsNames.join()}"`, async () => {
    await h(t).scenarioHelper.createTeams(teams);
  });
  await h(t).withLog(`Given I have a group with three members`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(group);
  });
  await h(t).withLog(`When I click search box`, async () => {
    const searchBar = app.homePage.header.searchBar;
    await searchBar.enter();
  });
  await h(t).withLog(`Then search box should be displayed`, async () => {
    const searchBox = searchDialog.recentPage.self;
    await t.expect(searchBox.exists).ok();
  });
  await h(t).log(`And I take screenshot `, { screenshotPath: 'Jupiter_TopBar_SearchBox' });
  await h(t).withLog(`When I search with "h"`, async () => {
    await searchDialog.typeSearchKeyword("h");
  });
  await h(t).withLog(`Then search result should be displayed`, async () => {
    const searchResult = searchDialog.instantPage.contentSearchHeader;
    await t.expect(searchResult.exists).ok();
  });
  await h(t).log(`And I take screenshot `, { screenshotPath: 'Jupiter_TopBar_SearchResult' });
  await h(t).withLog(`When I hover ${iconResults[0].position} then hover "message" button`, async () => {
    await t.hover(iconResults[0].item.self);
    await t.hover(iconResults[0].item.messageButton());
  });
  await h(t).withLog(`Then "message" button should be displayed`, async () => {
    await t.expect(iconResults[0].item.messageButton.exists).ok();
  });
  await h(t).log(`And I take screenshot`, { screenshotPath: `Jupiter_TopBar_MessageButton` });
  await h(t).withLog(`When I hover "call" button`, async () => {
    await t.hover(iconResults[0].item.telephonyButton())
  });
  await h(t).withLog(`Then "call" button should be displayed`, async () => {
    await t.expect(iconResults[0].item.telephonyButton.exists).ok();
  });
  await h(t).log(`And I take screenshot `, { screenshotPath: `Jupiter_TopBar_CallButton` });
  await h(t).withLog(`When I search with ${iconResults[2].keyword} and hover "join" button of ${iconResults[2].keyword}`, async () => {
    await app.homePage.searchDialog.clickClearButton();
    await app.homePage.searchDialog.typeSearchKeyword(iconResults[2].keyword);
    await t.hover(iconResults[2].item.self);
    await t.hover(iconResults[2].item.joinButton());
  });
  await h(t).withLog(`Then "join" button should be displayed`, async () => {
    await t.expect(iconResults[2].item.joinButton.exists).ok();
  });
  await h(t).log(`And I take screenshot `, { screenshotPath: `Jupiter_TopBar_JoinButton` });
  await h(t).withLog(`When I click ${iconResults[2].position}`, async () => {
    await t.click(iconResults[2].item.joinButton());
  });
  await h(t).withLog(`Then "Join team" popup should be displayed`, async () => {
    const joinTeamDialog = app.homePage.joinTeamDialog;
    await t.expect(joinTeamDialog.cancelButton.exists).ok();
  });
  await h(t).log(`And I take screenshot `, { screenshotPath: `Jupiter_TopBar_JoinTeamPopup` });
  await h(t).withLog(`When I click the "search" box again`, async () => {
    const joinTeamDialog = app.homePage.joinTeamDialog;
    const searchBar = app.homePage.header.searchBar;
    await joinTeamDialog.clickCancelButton();
    await searchBar.enter();
  });
  await h(t).withLog(`Then search history should be displayed`, async () => {
    const searchClearButton = app.homePage.searchDialog.recentPage.clearHistoryButton;
    await t.expect(searchClearButton.exists).ok();
  });
  await h(t).log(`And I take screenshot `, { screenshotPath: `Jupiter_TopBar_SearchHistory` });
  await h(t).withLog(`When I search with "@!#$" and click "@!#$" in this conversation`, async () => {
    await searchDialog.typeSearchKeyword("@!#$");
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
  });
  await h(t).log(`Then I take screenshot `, { screenshotPath: `Jupiter_TopBar_ContentSearch` });
  await h(t).withLog(`When I set filter post by ${anotherUserExtension} and hover "Remove" button`, async () => {
    const messagesTab = searchDialog.fullSearchPage.messagesTab;
    await messagesTab.postByField.typeText(anotherUserExtension);
    await messagesTab.postByField.selectMemberByNth(0);
    await t.hover(messagesTab.postByField.selectedItems.nth(-1).find('button'));
  });
  await h(t).withLog(`Then "Remove" button should be displayed`, async () => {
    const messagesTab = searchDialog.fullSearchPage.messagesTab;
    await t.expect(messagesTab.postByField.selectedItems.nth(-1).find('button').exists).ok();
  });
  await h(t).log(`And I take screenshot `, { screenshotPath: `Jupiter_TopBar_ContentSearchRemoveButton` });
  await h(t).withLog(`When I click "Type" selector`, async () => {
    const messagesTab = searchDialog.fullSearchPage.messagesTab;
    await messagesTab.openTypeOptions();
  });
  await h(t).withLog(`Then "Type Selector" selector box should be displayed `, async () => {
    const typeOption = searchDialog.fullSearchPage.messagesTab.typeOptionSelector;
    await t.expect(typeOption.exists).ok();
  })
  await h(t).log(`And I take screenshot `, { screenshotPath: `Jupiter_TopBar_TypeSelector` });
  await h(t).withLog(`When I click "Time posted" selector`, async () => {
    const messagesTab = searchDialog.fullSearchPage.messagesTab;
    await messagesTab.openTypeOptions();
    await messagesTab.openTimeOptions();
  })
  await h(t).withLog(`Then "Time posted" selector box should be displayed `, async () => {
    const timePostOption = searchDialog.fullSearchPage.messagesTab.timePostOptionSelector;
    await t.expect(timePostOption.exists).ok();
  })
  await h(t).log(`Then take screenshot`, { screenshotPath: `Jupiter_TopBar_TimePostedSelector` });
});
