import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Settings/EmailNotification')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Phone Settings', ['P2', 'Settings', 'EmailNotification', 'V1.6', 'Knight.Shen']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  const settingTab = app.homePage.settingTab;
  const notificationAndSoundsSettingPage = settingTab.notificationAndSoundPage;
  await h(t).withLog('When I open Settings > Notifications and sounds tab', async () => {
    await app.homePage.leftPanel.settingsEntry.enter();
    await settingTab.notificationAndSoundsEntry.enter();
    await notificationAndSoundsSettingPage.hoverOtherNotificationSettingsTitle();
  })

  await h(t).withLog('And I click time select box in direct messages', async () => {
    await notificationAndSoundsSettingPage.clickDirectMessagesSelectBox();
    await notificationAndSoundsSettingPage.hoverDirectMessagesOffItem();
  })

  await h(t).withLog('Then I can see Off item in select list', async () => {
    await t.expect(notificationAndSoundsSettingPage.directMessagesOffItem.exists).ok();
  })

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Settings_EmailNotification' })
})
