import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { v4 as uuid } from 'uuid';
import * as _ from "lodash";
import { IGroup } from "../../v2/models";

fixture('ContentPanel/TeamOverview')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase())
test(formalName('Check the all button on team conversation', ['P2','ContentPane', 'Messages', 'TeamOverview', 'V1.4', 'Hanny.Han']),
async (t: TestController) => {

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

  await h(t).withLog(`Given I own a team: "${team.name}"`, async () =>  {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`,async()=>{
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I open the team ${team.name}`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded;
  });

  await h(t).withLog('And when I hover lock icon', async () => {
    await t.hover(conversationPage.privateTeamIcon);
  });

  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_PrivateLock'});

  await h(t).withLog(`When I click lock button`, async () => {
    await t.click(conversationPage.privateTeamIcon);
  });

  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_PublicLock'});

  await h(t).withLog('When I hover members button', async () => {
    await t.hover(conversationPage.memberCountIcon);
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_Members'});
});
