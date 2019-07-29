/*
 * @Author: Mia.Cai
 * @Date: 2019-07-24 10:10:20
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { AppRoot } from '../../../v2/page-models/AppRoot/index';
import { h } from '../../../v2/helpers';
import { teardownCase, setupCase } from '../../../init';
import { BrandTire, SITE_URL } from '../../../config';
import { ITestMeta } from '../../../v2/models';

fixture('Setting/NotificationAndSounds')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2569'],
  keywords: ['Settings'],
  maintainers: ['Mia.Cai']
})('The sounds setting can sync with other ends', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[0];

  const app = new AppRoot(t);
  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const notificationAndSoundsPage = settingTab.notificationAndSoundPage;

  await h(t).glip(loginUser).init();
  const SOUNDS_FOR_RINGTONE={file:'blub-blub-ring.wav', name:'Blub Blub'};
  const SOUNDS_FOR_OTHERS ={file:'Alert3.wav', name:'Alert 3'};

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Notifications and Sounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });

  // Use api to change the settings for DM/Mentions/team/incoming calls/voicemails
  await h(t).withLog(`And I changed the sounds settings for DM/Mentions/Teams/Incoming call(use API)`, async () => {
    const data = {
      want_audio_notifications:SOUNDS_FOR_OTHERS.file, 
      one_on_one_audio_notifications:SOUNDS_FOR_OTHERS.file,
      at_mention_audio_notifications:SOUNDS_FOR_OTHERS.file,
      phone_audio_notifications:SOUNDS_FOR_RINGTONE.file
    };
    await h(t).glip(loginUser).updateProfile(data);
  });

  // Check the setting value for every item
  await h(t).withLog(`Then I can see the settings sync`, async () => {
    await notificationAndSoundsPage.soundsSection.showSoundInCurrentDirectMessagesSetting(SOUNDS_FOR_OTHERS.name);
    await notificationAndSoundsPage.soundsSection.showSoundInCurrentMentionsSetting(SOUNDS_FOR_OTHERS.name);
    await notificationAndSoundsPage.soundsSection.showSoundInCurrentTeamsMessagesSetting(SOUNDS_FOR_OTHERS.name);
    await notificationAndSoundsPage.soundsSection.showSoundInCurrentIncomingCallSetting(SOUNDS_FOR_RINGTONE.name);
  });

});
