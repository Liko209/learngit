import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Settings/SettingsPhoneRegionEdit')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Phone Settings', ['P2', 'Settings', 'SettingsPhoneRegionEdit', 'V1.6', 'Knight.Shen']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  const settingTab = app.homePage.settingTab;
  const phoneSettingPage = settingTab.phoneSettingPage;
  await h(t).withLog('When I open Settings > Phone tab and click Edit button for Region', async () => {
    await app.homePage.leftPanel.settingsEntry.enter();
    await settingTab.phoneEntry.enter();
    await phoneSettingPage.clickRegionUpdateButton();
  })

  await h(t).withLog('And I input invalid area code', async () => {
    await phoneSettingPage.updateRegionDialog.setAreaCode("0");
  })

  await h(t).withLog('Then I can see Region popup', async () => {
    await t.expect(phoneSettingPage.updateRegionDialog.statement.exists).ok();
  })

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Settings_PhoneRegion' })
})
