import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from "../../v2/helpers";
import { IGroup } from "../../v2/models";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from 'uuid';


fixture('RightRail/Links')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase());

test(formalName('Links display on the right rail', ['P2', 'Messages', 'RightRail', 'Links', 'V1.4', 'Lorna.Li']), async(t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

  const team = <IGroup> {
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: ${team.name}`, async() => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number} # ${loginUser.extension}`, async() => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamPage = app.homePage.messageTab.teamsSection;
  const rightRail = app.homePage.messageTab.rightRail;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('When I open a team and click Links Tab', async() => {
    await teamPage.conversationEntryById(team.glipId).enter();
    await rightRail.openMore();
    await rightRail.linksEntry.enter();
  });

  await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_RightRail_LinksEmpty'});

  const linksTab = rightRail.linksTab;
  await h(t).withLog('When I send a link', async() => {
    await conversationPage.sendMessage('http://www.google.com');
    await t.expect(linksTab.items.exists).ok();
  });

  await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_RightRail_LinksList'});
});
