import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Settings/SettingsPhoneChooseApp')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Phone Settings', ['P2', 'Settings', 'SettingsPhoneChooseApp', 'V1.6', 'V1.7', 'Knight.Shen']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  const settingTab = app.homePage.settingTab;
  const phoneSettingPage = settingTab.phoneSettingPage;
  await h(t).withLog('When I open Settings > Phone tab and open Caller Id drop down', async () => {
    await app.homePage.leftPanel.settingsEntry.enter();
    await settingTab.phoneEntry.enter();
    await phoneSettingPage.clickCallerIDDropDown();
    await phoneSettingPage.hoverRingCentralPhone();
  })

  await h(t).withLog('Then I can see CallerId drop down item', async () => {
    await t.expect(phoneSettingPage.callerIDDropDownItems.exists).ok();
  })

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Settings_Phone' })

  await h(t).withLog('When I choose Use RingCentral App', async () => {
    await phoneSettingPage.clickRingCentralPhone();
  })

  await h(t).withLog('Then I can see cancel button in Change default phone app popup', async () => {
    await t.expect(phoneSettingPage.changeRCPhoneDialog.cancelButton.exists).ok();
  })

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Settings_ChoosePhoneAlert'})
})
