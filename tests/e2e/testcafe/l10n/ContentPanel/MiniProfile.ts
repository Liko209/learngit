import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { v4 as uuid } from 'uuid';
import { IGroup } from "../../v2/models";

fixture('ContentPanelPanel/MemberProfile')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase());
test(formalName('Files display on the right rail', ['P2', 'Messages', 'ContentPanelPanel', 'MemberProfile', 'V1.4', 'Lorna.Li']), async(t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

  const team = <IGroup> {
    name: uuid(),
    type: "team",
    owner: loginUser,
    members: [loginUser]
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

  const miniProfile = app.homePage.miniProfile;
  await h(t).withLog('When I open a team and tap avatar', async() => {
    await teamPage.conversationEntryById(team.glipId).enter();
    // await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.postItemById(textPostId).clickAvatar();
    await t.expect(miniProfile.profileButton).ok();
  });

  await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_ContentPanelPanel_MiniProfile'});
});
