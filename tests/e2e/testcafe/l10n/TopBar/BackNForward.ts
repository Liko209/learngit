import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";



fixture('TopBar/BackNForward')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check "back" button and "forward" button', ['P2', 'TopBar', 'BackNForward', 'V1.4', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async() => {
    await h(t).directLoginWithUser(SITE_URL , loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog('When I hover "menu" button', async() => {
    const menuButton = app.homePage.leftPanel.toggleButton;
    await t.hover(menuButton);
  });
  await h(t).log('Then I take screenshot',{ screenshotPath: 'Jupiter_TopBar_MenuButton' });

  const dashboardButton = app.homePage.leftPanel.dashboardEntry;
  const header = app.homePage.header

  await h(t).withLog('When I click "dashboard" Tab and hover "back" button', async() => {
    await dashboardButton.enter();
    await header.hoverBackButton();
  });
  // await h(t).withLog('Then back button on header should be enabled', async() => {
  //   await backButton.shouldBeEnabled();
  // });
  await h(t).log('And I take screenshot',{ screenshotPath: 'Jupiter_TopBar_BackButton' });

  await h(t).withLog('When I click "back" button and I hover "forward" button', async() => {
    await header.clickBackButton();
    await header.hoverForwardButton();
  });
  // await h(t).withLog('Then forward button on header should be enabled', async() => {
  //   await forwardButton.shouldBeEnabled();
  // });
  await h(t).log('And I take screenshot',{ screenshotPath: 'Jupiter_TopBar_ForwardButton' });
});
