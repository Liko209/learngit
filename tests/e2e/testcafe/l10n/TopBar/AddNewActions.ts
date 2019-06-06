import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { v4 as uuid } from 'uuid';

fixture('TopBar/AddNewActions')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check "New actions" menu', ['P2', 'TopBar', 'AddNewActions', 'V1.4', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const otherUser = h(t).rcData.mainCompany.users[6];
  const publicTeamWithMe: IGroup = {
    name: `H-publicTeamWithMe ${uuid()}`,
    type: 'Team',
    isPublic: true,
    owner: loginUser,
    members: [loginUser,otherUser],
  };

  await h(t).withLog(`Given I own a team named ${publicTeamWithMe.name}`, async() => {
    await h(t).scenarioHelper.createTeam(publicTeamWithMe);
  });
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const addActionButton = app.homePage.addActionButton
  const createTeamEntry = app.homePage.addActionMenu.createTeamEntry;

  await h(t).withLog('When I hover "New actions" button', async() => {
    await t.hover(addActionButton);
  });
  await h(t).log(`Then I take screenshot`, {screenshotPath: 'Jupiter_TopBar_NewActionsButton'});

  await h(t).withLog('When I click "New actions" button', async() => {
    await t.click(addActionButton);
    await createTeamEntry.hoverSelf();
  });
  await h(t).withLog('Then "New actions" menu should be displayed', async () => {
    await t.expect(createTeamEntry.exists).ok()
  });
  await h(t).log('And I take screenshot', {screenshotPath: 'Jupiter_TopBar_NewActionsMenu'});

  await h(t).withLog('When I click "Create Team" button in new actions menu', async() => {
    await createTeamEntry.enter();
  });
  await h(t).withLog('Then "Create Team" popup should be displayed', async() => {
    const toggleList = app.homePage.createTeamModal.toggleList;
    await t.expect(toggleList.exists).ok();
  });
  await h(t).log('And I take screenshot' , {screenshotPath: 'Jupiter_TopBar_CreateTeamPopup'});

  const createTeamModal = app.homePage.createTeamModal;

  await h(t).withLog('When I fill "Team name" field with an existing name' , async() => {
    await createTeamModal.typeTeamName(publicTeamWithMe.name);
    await createTeamModal.clickCreateButton();
  });
  await h(t).log('Then I take screenshot' , {screenshotPath: 'Jupiter_TopBar_CreateDuplicatedTeam'});

  await h(t).withLog('When I open "Send New Message" in "News actions"', async() => {
    await createTeamModal.clickCancelButton();
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.sendNewMessageEntry.enter();
  });
  await h(t).withLog('Then "Send New Message" popup should be displayed', async () => {
    const newMessageTextarea =app.homePage.sendNewMessageModal.newMessageTextarea;
    await t.expect(newMessageTextarea.exists).ok();
  });
  await h(t).log('And I take screenshot' , {screenshotPath: 'Jupiter_TopBar_SendNewMessage'});
});


