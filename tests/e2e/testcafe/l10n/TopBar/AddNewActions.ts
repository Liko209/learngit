import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { v4 as uuid } from 'uuid';

fixture('TopBar/AddNewAction')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase())
test(formalName('Check menu tip', ['P2', 'AddNewActions', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const otherUser = h(t).rcData.mainCompany.users[6];
  const otherUserExtension = otherUser.extension;
  const publicTeamWithMe: IGroup = {
    name: `publicTeamWithMe ${uuid()}`,
    type: 'Team',isPublic: true,
    owner: loginUser,
    members: [loginUser,otherUser],
  };

  await h(t).glip(loginUser).init();

  await h(t).withLog('Given I own a team', async() => {
    await h(t).scenarioHelper.createTeam(publicTeamWithMe);
  });
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog(`When I hover "New actions" button`, async() => {
    const addActionButton = app.homePage.addActionButton
    await t.hover(addActionButton);
  });
  await h(t).log(`Then I take screenshot `, {screenshotPath: `Jupiter_TopBar_NewActionsButton`});
  await h(t).withLog(`When I click "New actions" button`, async() => {
    const addActionButton = app.homePage.addActionButton;
    const createTeamEntry = app.homePage.addActionMenu.createTeamEntry;
    await t.click(addActionButton);
    await createTeamEntry.hoverSelf();
  });
  await h(t).withLog(`Then "New actions" menu should be display`, async () => {
    const createTeamEntry = app.homePage.addActionMenu.createTeamEntry;
    await t.expect(createTeamEntry.exists).ok()
  });
  await h(t).log(`And I take screenshot `, {screenshotPath: `Jupiter_TopBar_NewActionsMenu`});
  await h(t).withLog(`When I open "Create Team" in "News actions Menu"`, async() => {
    const createTeamEntry = app.homePage.addActionMenu.createTeamEntry;
    await createTeamEntry.enter();
  });
  await h(t).withLog(`Then "Create Team" popup should be display`, async() => {
    const toggleList = app.homePage.createTeamModal.toggleList;
    await t.expect(toggleList.exists).ok();
  });
  await h(t).log(`And I take screenshot ` , {screenshotPath: `Jupiter_TopBar_CreateTeamPopup`});
  await h(t).withLog(`When I fill in "Team name" with an existing name` , async() => {
    const createTeamModal = app.homePage.createTeamModal;
    await createTeamModal.typeTeamName(publicTeamWithMe.name);
    await createTeamModal.clickCreateButton();
  });
  await h(t).log(`Then I take screenshot` , {screenshotPath: `Jupiter_TopBar_CreateTeamErrorMsg`});
  await h(t).withLog(`When I fill in "Members" with ${otherUserExtension} and hover "Remove" button`, async() =>{
    const createTeamModal = app.homePage.createTeamModal;
    await createTeamModal.memberInput.typeText(otherUserExtension);
    await createTeamModal.memberInput.selectMemberByNth(0);
    await t.hover(createTeamModal.memberInput.selectedItems.nth(-1).find('button'));
  });
  await h(t).withLog(`Then "Remove" button should be displayed`, async() => {
    const createTeamModal = app.homePage.createTeamModal;
    await t.expect(createTeamModal.memberInput.selectedItems.nth(-1).find('button').exists).ok();
  });
  await h(t).log(`And I take screenshot` , {screenshotPath: `Jupiter_TopBar_CreateTeamRemoveButton`});
  await h(t).withLog(`When I open "Send New Message" in "News actions"`, async() => {
    const createTeamModal = app.homePage.createTeamModal;
    await createTeamModal.clickCancelButton();
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.sendNewMessageEntry.enter();
  });
  await h(t).withLog(`Then "Send New Message" popup should be displayed`, async () => {
    const newMessageTextarea =app.homePage.sendNewMessageModal.newMessageTextarea;
    await t.expect(newMessageTextarea.exists).ok();
  });
  await h(t).log(`And I take screenshot ` , {screenshotPath: `Jupiter_TopBar_SendNewMessage`});
});
