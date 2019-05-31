import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { IGroup } from "../../v2/models";
import { v4 as uuid } from 'uuid';

fixture('ContentPanel/JoinPublicTeam')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase())

test(formalName('Check the unlock tip on team conversation', ['P2','ContentPane', 'Messages', 'JoinPublicTeam', 'V1.4', 'Hanny.Han']),
async (t: TestController) => {
  const users=h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  const app=new AppRoot(t);

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    isPublic: true,
    owner: loginUser,
    members: [loginUser, otherUser]
  }
  await h(t).withLog(`Given other create a team: "${team.name}"`, async () =>  {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${otherUser.company.number}#${otherUser.extension}`,async()=>{
    await h(t).directLoginWithUser(SITE_URL, otherUser);
    await app.homePage.ensureLoaded();
  })
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I open the team ${team.name}`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded;
  });

  await h(t).withLog('And I hover unlock icon', async () => {
    await t.hover(conversationPage.publicTeamIcon);
  });

  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_PublicTeam'})
});
