import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { v4 as uuid } from 'uuid';
import { IGroup } from "../../v2/models";
import { ProfileDialog } from "../../v2/page-models/AppRoot/HomePage/ViewProfile";
import { TeamSettingDialog } from "../../v2/page-models/AppRoot/HomePage/TeamSettingDialog";
import { LeaveTeamDialog } from "../../v2/page-models/AppRoot/HomePage/LeaveTeamDialog";

fixture('ContentPanel/TeamMemberSettings')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase());
test(formalName('Check team member settings and leave team button are displayed correct', ['P2', 'Messages', 'ContentPanel', 'TeamMemberSettings', 'V1.4', 'Lorna.Li']), async(t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).glip(loginUser).init();

  const team = <IGroup> {
    name: uuid(),
    type: "Team",
    owner: otherUser,
    members: [loginUser, otherUser]
  }

  let textPostId;
  await h(t).withLog(`Given I have a team named: ${team.name}`, async() => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const postText = uuid();
  await h(t).withLog(`And I send a text post:${postText}`, async() => {
    textPostId = await h(t).scenarioHelper.sentAndGetTextPostId(postText, team, loginUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number} # ${loginUser.extension}`, async() => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamPage = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('When I open a team and tap Members icon', async() => {
    await teamPage.conversationEntryById(team.glipId).enter();
    await conversationPage.clickMemberCountIcon();
  });

  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog('And I tap Settings icon', async() => {
    await profileDialog.clickSetting();
  });

  await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_ContentPanel_TeamMemberSettings'});

  const leaveTeamDialog = app.homePage.leaveTeamDialog;
  await h(t).withLog('When I tap Leave team button', async() => {
    await teamSettingDialog.clickLeaveTeamButton();
  });

  await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_ContentPanel_LeaveTeam'});
});
