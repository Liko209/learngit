import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from "uuid"

fixture('RightRail/Links')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase())
test(formalName('Links display on the right rail', ['P2', 'RightRail', 'Links', 'V1.4', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const otherUser = h(t).rcData.mainCompany.users[6];
  let teamID: string, teamName: string = `Team ${uuid()}`;

  //await h(t).glip(loginUser).init();

  await h(t).withLog(`Given I have a team conversation: "${teamName}"`, async () => {
    teamID = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Team',
      name: teamName,
      members: [loginUser.rcId, otherUser.rcId],
    });
  });
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const rightRail = app.homePage.messageTab.rightRail;

  await h(t).withLog('When I open the created team conversation and open "Links" tab on right rail', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(teamID).enter();
    await rightRail.openMore();
    await rightRail.linksEntry.enter();
  });
  await h(t).log('Then I take screenshot' , { screenshotPath:'Jupiter_RightRail_LinksEmpty' });

  await h(t).withLog('When I send a link in the created team conversation' , async () =>{
    const conversationPage = app.homePage.messageTab.conversationPage;
    await conversationPage.sendMessage("www.google.com");
  });
  await h(t).withLog('And the text "Links" should be display', async () => {
    const listSubTitle = rightRail.listSubTitle;
    await t.expect(listSubTitle.exists).ok();
  });
  await h(t).log('Then I take screenshot' , { screenshotPath:'Jupiter_RightRail_LinksList' });
});
