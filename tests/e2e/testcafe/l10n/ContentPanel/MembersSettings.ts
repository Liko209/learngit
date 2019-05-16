import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from "../../v2/helpers";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { v4 as uuid } from 'uuid';


fixture('ContentPanel/MembersSettings')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase())

test(formalName('Check the MembersSettings page',['P2', 'MembersSettings', 'V1.4', 'Hanny.han']),async (t) => {
  const users=h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  const app=new AppRoot(t);

  let team = <IGroup>{
    name: `publicTeamWithMe${uuid()}`,
    type: "Team",
    members: [loginUser, otherUser],
    owner: loginUser
  }

  await h(t).withLog(`Given I own a team: "${team.name}"`, async() => {
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

  await h(t).withLog('When click members button', async () => {
    await t.click(conversationPage.memberCountIcon);
  });
  await h(t).log(`Then I capture screenshot`,{screenshotPath:'Jupiter_ContentPanel_TeamProfile'})

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('When hover settings button', async () => {
    await t.hover(profileDialog.settingButton);
  })
  await h(t).log(`Then I capture screenshot`,{screenshotPath:'Jupiter_ContentPanel_TeamSettings'})

  await h(t).withLog('When click more button', async () => {
    await t.click(profileDialog.moreIcon);
  })
  await h(t).log(`Then I capture screenshot`,{screenshotPath:'Jupiter_ContentPanel_TeamMore'})

  await h(t).withLog('When click more button again and click add team members button', async () => {
    await t.click(profileDialog.moreIcon);
    await t.click(profileDialog.addMembersIcon);
  })
  await h(t).log(`Then I capture screenshot`,{screenshotPath:'Jupiter_ContentPanel_AddTeamMembers'})
});
