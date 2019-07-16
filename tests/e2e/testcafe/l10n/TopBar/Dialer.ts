import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";


fixture('TopBar/Dialer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check "Dialer" in top bar',['P2','TopBar', 'Dialer', 'V1.4', 'Hank.Huang']),async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I hover "Dialer" button', async() => {
    await app.homePage.hoverDialpadButton();
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_TopBar_DialpadButton' });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I click "Dialer" button', async() => {
    await app.homePage.openDialer();
  });
  await h(t).withLog('Then "Dialer" page should be displayed', async() => {
    await t.expect(telephonyDialog.title.exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_TopBar_DialpadPage' });

  await h(t).withLog('When I hover "Minimize" button', async() => {
    await telephonyDialog.hoverMinimizeButton();
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_TopBar_DialpadMinimizeButton' });
});
