import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { IGroup } from "../../v2/models";
import { v4 as uuid } from 'uuid';

fixture('ContentPanel/InputBox')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase())

test(formalName('Check @Team Notify Everyone display ', ['P2', 'ContentPanel','InputBox', 'V1.7', 'Hanny.Han']),
async(t: TestController) => {
  const app = new AppRoot(t);
	const users = h(t).rcData.mainCompany.users;
	const loginUser = users[4];
	const otherUser = users[5];

	let team = <IGroup>{
    name: `publicTeamWithMe${uuid()}`,
    type: "Team",
    owner: loginUser,
    members: [loginUser,otherUser]
  }
  await h(t).withLog(`Given other create a team: "${team.name}"`, async () =>  {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`,async()=>{
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open the created team conversation',async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And I type "@" in input box', async() => {
    await t.click(conversationPage.messageInputArea).typeText(conversationPage.messageInputArea, "@");
  });

  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_TeamNotifyEveryone'});
});
