import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";

fixture('ContentPanel/GetStartedCompanyTeam')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase())

test(formalName('Check the GetStarted page ', ['P2', 'ContentPanel','Messages', 'GetStartedCompanyTeam', 'V1.6', 'Hanny.Han']),
async(t: TestController) => {

  const users=h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  const app=new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`,async()=>{
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  await h(t).withLog('When I click search box', async () => {
    const searchBar = app.homePage.header.searchBar;
    await searchBar.enter();
  });

  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog('And I search with "Inc"', async () => {
    await searchDialog.typeSearchKeyword("Inc");
  });

  const firstConversationResult = searchDialog.instantPage.nthConversation(0);
  const rightRail=app.homePage.messageTab.rightRail;
  await h(t).withLog('And I click "Team RingCentral Inc."', async () => {
    await t.click(firstConversationResult.self);
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_GetStartedCompanyTeam'});
});
