import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { v4 as uuid } from "uuid"

fixture('TopBar/Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check "Search" bar', ['P2', 'TopBar', 'Search', 'V1.4', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const otherUser = h(t).rcData.mainCompany.users[6];
  const anotherUser = h(t).rcData.mainCompany.users[7];
  const searchDialog = app.homePage.searchDialog;
  const group: IGroup = {
    type: 'Group',
    owner: loginUser,
    members: [loginUser, otherUser, anotherUser],
  };
  const publicTeamWithoutMe: IGroup = {
    name: `H-PublicTeamWithoutMe ${uuid()}`,
    type: 'Team',
    isPublic: true,
    owner: anotherUser,
    members: [otherUser, anotherUser],
  };
  const teams = Array.from({ length: 3 }, (x, i) => <IGroup>{
    name: `${i}-${uuid()}`,
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  })

  await h(t).withLog('Given I have a team without me', async () => {
    await h(t).scenarioHelper.createTeam(publicTeamWithoutMe);
  });
  await h(t).withLog('And I have three teams', async () => {
    await h(t).scenarioHelper.createTeams(teams);
  });
  await h(t).withLog('And I have a group with three members', async () => {
    await h(t).scenarioHelper.createOrOpenChat(group);
  });
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog('When I click search box', async () => {
    const searchBar = app.homePage.header.searchBar;
    await searchBar.enter();
  });
  await h(t).withLog('Then search box should be displayed', async () => {
    const searchBox = searchDialog.recentPage.self;
    await t.expect(searchBox.exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_TopBar_SearchBox' });

  await h(t).withLog('When I search with "H"', async () => {
    await searchDialog.typeSearchKeyword("H");
  });
  await h(t).withLog('Then search result should be displayed', async () => {
    const searchResult = searchDialog.instantPage.contentSearchHeader;
    await t.expect(searchResult.exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_TopBar_SearchResult' });

  const firstConversationResult = searchDialog.instantPage.nthConversation(0);

  await h(t).withLog('When I hover "the first conversation result" then hover "message" button', async () => {
    await t.hover(firstConversationResult.self);
    await t.hover(firstConversationResult.messageButton());
  });
  await h(t).withLog('Then "message" button should be displayed', async () => {
    await t.expect(firstConversationResult.messageButton().exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_TopBar_MessageButton' });

  await h(t).withLog('When I hover "call" button', async () => {
    await t.hover(firstConversationResult.telephonyButton())
  });
  await h(t).withLog('Then "call" button should be displayed', async () => {
    await t.expect(firstConversationResult.telephonyButton().exists).ok();
  });
  await h(t).log(`And I take screenshot`, { screenshotPath: 'Jupiter_TopBar_CallButton' });

  const theTeamWhichWithoutMe = searchDialog.instantPage.nthTeam(0)
  const joinTeamDialog = app.homePage.joinTeamDialog;

  await h(t).withLog(`When I search with ${publicTeamWithoutMe.name} and click it `, async () => {
    await searchDialog.typeSearchKeyword(publicTeamWithoutMe.name);
    await t.click(theTeamWhichWithoutMe.self);
  });

  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_TopBar_JoinTeamPopup' });

  await h(t).withLog('When I click the "search" box again', async () => {
    const searchBar = app.homePage.header.searchBar;
    await joinTeamDialog.clickCancelButton();
    await searchBar.enter();
  });
  await h(t).withLog('Then search history should be displayed', async () => {
    const searchClearButton = app.homePage.searchDialog.recentPage.clearHistoryButton;
    await t.expect(searchClearButton.exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_TopBar_SearchHistory' });

  await h(t).withLog('When I search with "@!#$" and click "@!#$" in this conversation', async () => {
    await searchDialog.typeSearchKeyword("@!#$");
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_TopBar_ContentSearch' });

  await h(t).withLog(`When I set filter post by ${anotherUser.extension} and hover "Remove" button`, async () => {
    const messagesTab = searchDialog.fullSearchPage.messagesTab;
    await messagesTab.postByField.typeText(anotherUser.email);
    await messagesTab.postByField.selectMemberByNth(0);
    await t.hover(messagesTab.postByField.selectedItems.nth(-1).find('button'));
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_TopBar_ContentSearchRemoveButton' });

  await h(t).withLog('When I click "Type" selector', async () => {
    const messagesTab = searchDialog.fullSearchPage.messagesTab;
    await messagesTab.openTypeOptions();
  });
  await h(t).withLog('Then "Type Selector" selector box should be displayed', async () => {
    const typeOption = searchDialog.fullSearchPage.messagesTab.typeOptionSelector;
    await t.expect(typeOption.exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_TopBar_TypeFilters' });

  await h(t).withLog('When I click "Time posted" selector', async () => {
    const messagesTab = searchDialog.fullSearchPage.messagesTab;
    await messagesTab.openTypeOptions();
    await messagesTab.openTimeOptions();
  });
  await h(t).withLog('Then "Time posted" selector box should be displayed', async () => {
    const timePostOption = searchDialog.fullSearchPage.messagesTab.timePostOptionSelector;
    await t.expect(timePostOption.exists).ok();
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_TopBar_TimePostedFilters' });
});
