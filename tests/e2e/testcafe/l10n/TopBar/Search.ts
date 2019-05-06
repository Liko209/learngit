import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import {v4 as uuid} from "uuid"

fixture('Search').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase())
test(formalName('Check menu tip', ['P0', 'Search', 'Hank']), async (t) => {
const loginUser = h(t).rcData.mainCompany.users[6];
await h(t).glip(loginUser).init();
const anotherUser = h(t).rcData.mainCompany.users[5];
const anotherUser2 = h(t).rcData.mainCompany.users[7];
const anotherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);
const app = new AppRoot(t);
const searchBar = app.homePage.header.searchBar;
const searchDialog = app.homePage.searchDialog;
const joinTeamDialog = app.homePage.joinTeamDialog;
const messagesTab = searchDialog.fullSearchPage.messagesTab;

const group: IGroup = {
type: 'group',
owner: loginUser,
members: [loginUser,anotherUser,anotherUser2],
}
const team: IGroup ={
name: "hPublicTeamWithoutMe",
type: 'Team',isPublic: true,
owner: anotherUser,
members: [anotherUser,anotherUser2],
}
const teamsNames = Array(3).fill(null).map(() => "h"+uuid())
const teams: IGroup[] = teamsNames.map(name => ({
name,
type: 'Team',isPublic: true,
owner: loginUser,
members: [loginUser,anotherUser,anotherUser2],
}));
const iconResults = [{
keyword: "@!#$",
item: searchDialog.instantPage.nthConversation(0),
position: "the first conversation result"
}, {
keyword: anotherUserName,
item: searchDialog.instantPage.nthGroup(0),
position: "the first groups result"
}, {
keyword: team.name,
item: searchDialog.instantPage.nthTeam(0),
position: "the team which without me"
}];
const teamId = await h(t).glip(loginUser).getTeamIdByName(teams[0].name);
await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async() => {
await h(t).directLoginWithUser(SITE_URL, loginUser);
await app.homePage.ensureLoaded();
});
await h(t).withLog(`Given I have a team without me"`, async() =>{
await h(t).scenarioHelper.createTeam(team);
})
await h(t).withLog(`Given I have five teams named "${teamsNames.join()}"`, async() => {
await h(t).scenarioHelper.createTeams(teams);
})
await h(t).withLog(`Given I have a group with three members`, async() => {
await h(t).scenarioHelper.createOrOpenChat(group);
})
await h(t).withLog(`When I click search box`, async () => {
await searchBar.enter();
});
await h(t).log(`Then take screenshot Jupiter_TopBar_SearchBox `, {screenshotPath: 'Jupiter_TopBar_SearchBox'}
);
await h(t).withLog(`When I search with "h"`, async () => {
await app.homePage.searchDialog.typeSearchKeyword("h");
})
await h(t).log(`Then take screenshot Jupiter_TopBar_SearchResult`, {screenshotPath: 'Jupiter_TopBar_SearchResult'}
);
// await h(t).withLog(`Then I click "Clear" button`, async() => {
// await app.homePage.searchDialog.clickClearButton();
// })
// await h(t).log(`Then take screenshot Jupiter_TopBar_SearchHistory`,{screenshotPath: 'Jupiter_TopBar_SearchHistory'}
// );
await h(t).withLog(`When I hover ${iconResults[0].position} then hover "message" button`, async() => {
await t.hover(iconResults[0].item.self);
await t.hover(iconResults[0].item.messageButton());
})
await h(t).log(`Then take screenshot Jupiter_TopBar_MessageButton`, {screenshotPath: `Jupiter_TopBar_MessageButton`}
);
await h(t).withLog(`When I hover "call" button`, async() => {
await t.hover(iconResults[0].item.telephonyButton())
})
await h(t).log(`Then take screenshot Jupiter_TopBar_CallButton`, {screenshotPath: `Jupiter_TopBar_CallButton`}
);
await h(t).withLog(`When I search with ${iconResults[2].keyword} and hover "join" button of ${iconResults[2].keyword}`, async() => {
await app.homePage.searchDialog.clickClearButton();
await app.homePage.searchDialog.typeSearchKeyword(iconResults[2].keyword);
await t.hover(iconResults[2].item.self);
await t.hover(iconResults[2].item.joinButton());
});
await h(t).log(`Then take screenshot Jupiter_TopBar_JoinButton`, {screenshotPath: `Jupiter_TopBar_JoinButton`}
);
await h(t).withLog(`When I click ${iconResults[2].position}`, async() => {
await t.click(iconResults[2].item.joinButton());
});
await h(t).log(`Then take screenshot Jupiter_TopBar_JoinTeamPopup`, {screenshotPath: `Jupiter_TopBar_JoinTeamPopup`}
);
await h(t).withLog(`When I click the "search" box again`, async() => {
await joinTeamDialog.clickCancelButton();
await searchBar.enter();
});
await h(t).log(`Then take screenshot Jupiter_TopBar_SearchHistory`, {screenshotPath: `Jupiter_TopBar_SearchHistory`}
);
await h(t).withLog(`When I search with "@!#$" and click "@!#$" in this conversation`, async() => {
await searchDialog.typeSearchKeyword("@!#$");
await searchDialog.instantPage.clickContentSearchGlobalEntry();
});
await h(t).withLog(`And I set filter post by ${anotherUserName} and hover "remove" button`, async() => {
await messagesTab.postByField.typeText(anotherUserName);
await messagesTab.postByField.selectMemberByNth(0);
await t.hover(messagesTab.postByField.selectedItems.nth(-1).find('button'));
});
await h(t).log(`Then take screenshot Jupiter_TopBar_RemoveButton`, {screenshotPath: `Jupiter_TopBar_ContentSearch`}
);
await h(t).withLog(`When I click "Type" Selector`, async() => {
await messagesTab.openTypeOptions();
})
await h(t).log(`Then take screenshot Jupiter_TopBar_TypeSelector`, {screenshotPath: `Jupiter_TopBar_TypeSelector`}
)
await h(t).withLog(`When I click "Time posted" Selector`, async() => {
await messagesTab.openTypeOptions();
await messagesTab.openTimeOptions();
})
await h(t).log(`Then take screenshot Jupiter_TopBar_TimePostedSelector`, {screenshotPath: `Jupiter_TopBar_TimePostedSelector`}
)
})
