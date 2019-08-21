import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from "../../config";
import { setupCase, teardownCase } from "../../init";
import { h } from "../../v2/helpers";

fixture('Settings/EmergencyAddress')
  .beforeEach(setupCase(BrandTire.DID_WITH_MULTI_REGIONS))
  .afterEach(teardownCase());
test(formalName('Check Emergency Address Settings', ['P2', 'Settings', 'EmergencyAddress', 'V1.7','Hanny.han']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  const settingTab = app.homePage.settingTab;
  const phoneSetting = settingTab.phoneSettingPage;
  await h(t).withLog('When I open Phone tab and setting Region, click Emergency Address Edit button', async () => {
    await app.homePage.leftPanel.settingsEntry.enter();
    await settingTab.phoneEntry.enter();
    await phoneSetting.clickEmergencyAddressSettingEditButton();
  });
  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Settings_EmergencyEdit_01' });

})
