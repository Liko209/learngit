import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { v4 as uuid } from 'uuid';
import { IGroup } from "../../v2/models";

fixture('RightRail/Files')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase());
test(formalName('Files display on the right rail', ['P2', 'Messages', 'RightRail', 'Files', 'V1.4', 'Lorna.Li']), async(t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];

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

  await h(t).withLog('When I open a team and click Files Tab', async() => {
    await teamPage.conversationEntryById(team.glipId).enter();
    await rightRail.filesEntry.enter();
  });

  await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_RightRail_FilesEmpty'});

  const message = uuid();
  await h(t).withLog('When I upload a text file', async()=>{
    await conversationPage.uploadFilesToMessageAttachment('../../sources/1.txt');
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_RightRail_FilesList'});
});
