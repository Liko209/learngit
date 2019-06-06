import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { IGroup } from "../../v2/models";
import { v4 as uuid } from 'uuid';

fixture('ContentPanel/TeamJoinFail')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase());

test(formalName('Check the fail alert on join team page', ['P2','ContentPane', 'Messages', 'TeamJoinFail', 'V1.4', 'Hanny.Han']),
async (t: TestController) => {
  const users=h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  const anotherUser = users[6];
  const app=new AppRoot(t);

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    isPublic: true,
    owner: otherUser,
    members: [otherUser, anotherUser]
  }
  await h(t).withLog(`Given other create a team: "${team.name}"`, async () =>  {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog('When I click search box', async () => {
    const searchBar = app.homePage.header.searchBar;
    await searchBar.enter();
  });

  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog('Then search box should be displayed', async () => {
    const searchBox = searchDialog.recentPage.self;
    await t.expect(searchBox.exists).ok();
  });
  const theTeamWhichWithoutMe = searchDialog.instantPage.nthTeam(0);
  const joinTeamDialog = app.homePage.joinTeamDialog;
  await h(t).withLog(`When I search with ${team.name} and click "join" button of ${team.name}`, async () => {
    await searchDialog.typeSearchKeyword(team.name);
    await t.hover(theTeamWhichWithoutMe.self);
    await t.click(theTeamWhichWithoutMe.self);
    // await t.expect(joinTeamDialog.cancelButton.exists).ok();
  });

  await h(t).withLog('And I set the team as private', async () => {
    await h(t).scenarioHelper.updateTeam(team, { isPublic: false });
  });

  await h(t).withLog('And I click the join team button', async () => {
     await t.click(joinTeamDialog.joinButton);
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_JoinTeamFail'});
});
