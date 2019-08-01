import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Settings/OtherNotification')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Phone Settings', ['P2', 'Settings', 'OtherNotification', 'V1.6', 'Knight.Shen']), async (t) => {
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
    await notificationAndSoundsSettingPage.hoverMicrophoneSourceSelectBox();
  })

  await h(t).withLog('And I click select box in new message badge count', async () => {
    await notificationAndSoundsSettingPage.clickNewMessageBadgeCountSelectBox();
    await notificationAndSoundsSettingPage.hoverAllNewMessagesItem();
  })

  await h(t).withLog('Then I can see Direc messages and mentions only item in select list', async () => {
    await t.expect(notificationAndSoundsSettingPage.directMessagesAndMentionsOnlyItem.exists).ok();
  })

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Settings_OtherNotification' })
})
