import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";


fixture('AddNewActions').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase())
test(formalName('Check menu tip', ['P0', 'AddNewActions', 'Hank']), async (t) => {
const loginUser = h(t).rcData.mainCompany.users[5];
await h(t).glip(loginUser).init();
const app = new AppRoot(t);
const addActionButton = app.homePage.addActionButton
const createTeamModal = app.homePage.createTeamModal;
const anotherUser = h(t).rcData.mainCompany.users[7];
const anotherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);
const createTeamEntry = app.homePage.addActionMenu.createTeamEntry;
const team: IGroup ={
name: "PublicTeamWithMe",
type: 'Team',isPublic: true,
owner: loginUser,
members: [anotherUser,loginUser],
}

await h(t).withLog(`Given I have a team with me"`, async() =>{
await h(t).scenarioHelper.createTeam(team);
})
await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
await h(t).directLoginWithUser(SITE_URL, loginUser);
await app.homePage.ensureLoaded();
});
await h(t).withLog(`When I hover "New actions" button`, async () => {
await t.hover(addActionButton);
});
await h(t).log(`Then take screenshot Jupiter_TopBar_NewActionsButton`, {screenshotPath: `Jupiter_TopBar_NewActionsButton`}
);
await h(t).withLog(`When I click "New actions" button`, async() => {
await t.click(addActionButton);
await createTeamEntry.hoverSelf();
});
await h(t).log(`Then take screenshot Jupiter_TopBar_NewActionsMenu` , {screenshotPath: `Jupiter_TopBar_NewActionsMenu`}
);
await h(t).withLog(`When I open "Create Team" in "News actions" Menu`, async() => {
await createTeamEntry.enter();
});
await h(t).log(`Then take screenshot Jupiter_TopBar_CreateTeam01` , {screenshotPath: `Jupiter_TopBar_CreateTeam01`}
);
await h(t).withLog(`When I fill in "Team name" with an existing name` , async() => {
await createTeamModal.typeTeamName(team.name);
await createTeamModal.clickCreateButton();
});
await h(t).withLog(`And I fill in "Members" with ${anotherUserName} and hover "Remove" button`, async() =>{
await createTeamModal.memberInput.typeText(anotherUserName);
await createTeamModal.memberInput.selectMemberByNth(0);
await t.hover(createTeamModal.memberInput.selectedItems.nth(-1).find('button'));
});
await h(t).log(`Then take screenshot Jupiter_TopBar_CreateTeam02` , {screenshotPath: `Jupiter_TopBar_CreateTeam02`}
);
await h(t).withLog(`When I open "Send New Message" in "News actions"`, async() => {
await createTeamModal.clickCancelButton();
await app.homePage.openAddActionMenu();
await app.homePage.addActionMenu.sendNewMessageEntry.enter();
});
await h(t).log(`Then take screenshot Jupiter_TopBar_SendNewMessage` , {screenshotPath: `Jupiter_TopBar_SendNewMessage`}
);
});
