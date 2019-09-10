import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from "../../v2/helpers";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { v4 as uuid } from 'uuid';

fixture('ContentPanel/TeamSetting')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase())

test(formalName('Check the TeamSetting page',['P2','ContentPanel','Messages', 'TeamSetting', 'V1.4', 'Hanny.Han']),async (t) => {

  const users=h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  const app=new AppRoot(t);

  let team = <IGroup>{
    name: `publicTeamWithMe${uuid()}`,
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  }
  await h(t).withLog(`Given I own a team: "${team.name}"`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`,async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I open the team ${team.name}`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded;
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('And I click members button and click settings button', async () => {
    await t.click(conversationPage.memberCountIcon);
    await t.click(profileDialog.settingButton);
  });

  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_TeamSettingsDetail'});

  const teamSettingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog('When I click Archive tip button', async () => {
    await teamSettingDialog.clickArchiveTeamButton();
  })
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_ArchiveTeam'});

  const archiveTeamDialog = app.homePage.archiveTeamDialog;
  await h(t).withLog('When I click archive team cancel button and click delete team button', async () =>{
    await archiveTeamDialog.clickCancel();
    await teamSettingDialog.clickDeleteTeamButton();
  })
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_DeleteTeam'});
});
