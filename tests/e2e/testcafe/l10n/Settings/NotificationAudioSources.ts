import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Settings/NotificationAudioSources')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Phone Settings', ['P2', 'Settings', 'NotificationAudioSources', 'V1.6', 'Knight.Shen']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingTab = app.homePage.settingTab;
  const notificationAndSoundsSettingPage = settingTab.notificationAndSoundPage;
  await h(t).withLog('When I open Settings > Notifications and sounds tab', async () => {
    await app.homePage.leftPanel.settingsEntry.enter();
    await settingTab.notificationAndSoundsEntry.enter();
    await notificationAndSoundsSettingPage.hoverAudioSourcesVolumeControlLabel();
  });

  await h(t).withLog('And I click Microphone source select box', async () => {
    await notificationAndSoundsSettingPage.clickMicrophoneSourceSelectBox();
    await notificationAndSoundsSettingPage.hoverRingerSourceSelectBox();
  });

  await h(t).withLog('Then I can see Use system default item in select list', async () => {
    await t.expect(notificationAndSoundsSettingPage.microphoneSourceDefaultItem.exists).ok();
  });

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Settings_NotificationMicrophoneSource' });

  await h(t).withLog('When I click Ringer source select box', async () => {
    await notificationAndSoundsSettingPage.hoverAudioSourcesVolumeControlLabel();
    await notificationAndSoundsSettingPage.clickMicrophoneSourceSelectBox();
    await notificationAndSoundsSettingPage.clickRingerSourceSelectBox();
    await notificationAndSoundsSettingPage.hoverRingSourceSelectBoxOffItem();
  });

  await h(t).withLog('Then I can see All audio sources item in select list', async () => {
    await t.expect(notificationAndSoundsSettingPage.ringerSourceAllAudioSourcesItem.exists).ok();
  });

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Settings_NotificationRingerSource' });

})
