import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from "../../v2/helpers";
import { IGroup } from "../../v2/models";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from 'uuid';


fixture('RightRail/Integrations')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Integrations display on the right rail', ['P2', 'Messages', 'RightRail', 'Integrations', 'V1.4', 'Hank.Huang']), async(t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const team = <IGroup> {
    name: `H-${uuid()}`,
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  };

  await h(t).glip(loginUser).init();

  await h(t).withLog(`Given I have a team conversation: "${team.name}" `, async() => {
    await h(t).scenarioHelper.createTeam(team);
  });
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number} # ${loginUser.extension}`, async() => {
    await h(t).directLoginWithUser(SITE_URL,loginUser);
    await app.homePage.ensureLoaded;
  });

  const rightRail = app.homePage.messageTab.rightRail;

  await h(t).withLog('When I open the created team conversation and open "Notes" tab on right rail', async() => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryByName(team.name);
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.openMore();
    await rightRail.integrationsEntry.enter();
  });
  await h(t).log('Then I take screenshot' , { screenshotPath:'Jupiter_RightRail_IntegrationsEmpty'} );
});
