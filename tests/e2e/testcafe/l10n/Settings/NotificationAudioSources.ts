import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Settings/NotificationAudioSources')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Phone Settings', ['P2', 'Settings', 'NotificationAudioSources', 'V1.6','V1.7','Hanny.han', 'Knight.Shen']), async (t) => {
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
    await notificationAndSoundsSettingPage.hoverAudioSourcesVolumeControlLabel();
  })
  // const soundsSection = settingTab.notificationAndSoundPage;
  await h(t).withLog('And I scroll up to sounds section and click Direct Message select box', async () => {
    await notificationAndSoundsSettingPage.soundsSection.clickSoundDirectMessages();
    // await notificationAndSoundsSettingPage.soundsSection.hoverAudioSpeakerButton();
  })
  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Settings_SoundsChoose' });

  await h(t).withLog('And I scroll up to sounds section and click Direct Message select box', async () => {
    await notificationAndSoundsSettingPage.soundsSection.clickIncomingVoiceCallsLable();
    await notificationAndSoundsSettingPage.soundsSection.clickIncomingVoiceCalls();
    await notificationAndSoundsSettingPage.soundsSection.hoverIncomingVoiceCallsSelectBoxItem();
  })
  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Settings_IncomingVoiceCallsChoose_01'});

  // await h(t).withLog('And I scroll up to off', async () => {
  //   await notificationAndSoundsSettingPage.soundsSection.hoverIncomingVoiceCallsSelectBoxItem();
  // })
  // await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Settings_IncomingVoiceCallsChoose_02'});


  // await h(t).withLog('When I click Microphone source select box', async () => {
  //   await notificationAndSoundsSettingPage.clickMicrophoneSourceSelectBox();
  //   await notificationAndSoundsSettingPage.hoverRingerSourceSelectBox();
  // })

  // await h(t).withLog('And I can see Use system default item in select list', async () => {
  //   await t.expect(notificationAndSoundsSettingPage.microphoneSourceDefaultItem.exists).ok();
  // })

  // await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Settings_NotificationMicrophoneSource' })

  // await h(t).withLog('When I click Ringer source select box', async () => {
  //   await notificationAndSoundsSettingPage.hoverAudioSourcesVolumeControlLabel();
  //   await notificationAndSoundsSettingPage.clickMicrophoneSourceSelectBox();
  //   await notificationAndSoundsSettingPage.clickRingerSourceSelectBox();
  //   await notificationAndSoundsSettingPage.hoverRingSourceSelectBoxOffItem();
  // })

  // await h(t).withLog('And I can see All audio sources item in select list', async () => {
  //   await t.expect(notificationAndSoundsSettingPage.ringerSourceAllAudioSourcesItem.exists).ok();
  // })

  // await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Settings_NotificationRingerSource' })

})
