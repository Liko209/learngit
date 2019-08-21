import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Settings/SoundsSetting')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

  test(formalName('Check Sounds Settings', ['P2', 'SoundsSetting', 'NotificationAndSounds', 'V1.7', 'Hanny.han']), async (t) => {
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

  await h(t).withLog('And I scroll up to sounds section and click Direct Message select box', async () => {
    await notificationAndSoundsSettingPage.soundsSection.clickSoundDirectMessages();
  });
  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Settings_SoundsChoose_01' });

  await h(t).withLog('When I scroll up to off', async () => {
    await notificationAndSoundsSettingPage.soundsSection.hoverSoundDirectMessagesSelectBoxItem();
  });
  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Settings_SoundsChoose_02' });

  await h(t).withLog('When I scroll up to sounds section and click Incoming Voice Call select box', async () => {
    await notificationAndSoundsSettingPage.soundsSection.clickIncomingVoiceCallsLabel();
    await notificationAndSoundsSettingPage.soundsSection.clickIncomingVoiceCalls();
    await notificationAndSoundsSettingPage.soundsSection.hoverIncomingVoiceCallsSelectBoxItemTop();
  });
  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Settings_IncomingVoiceCallsChoose_01'});

  await h(t).withLog('When I scroll up to off', async () => {
    await notificationAndSoundsSettingPage.soundsSection.hoverIncomingVoiceCallsSelectBoxItemOff();
  });
  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Settings_IncomingVoiceCallsChoose_02'});

})
