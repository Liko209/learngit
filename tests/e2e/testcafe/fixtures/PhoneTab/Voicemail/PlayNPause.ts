/*
 * @Author: Potar.He
 * @Date: 2019-06-06 09:53:59
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-07-17 13:33:45
 */

import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta, IUser } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { ensuredOneVoicemail, addVoicemail } from './utils';

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2184'],
  maintainers: ['Potar.He'],
  keywords: ['voicemail']
})('VM is play 100%', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const callee = users[4];
  const caller = users[5];

  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click voicemail entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.phoneTab.voicemailEntry.enter();
  });

  await h(t).withLog('Then voicemail page should be open', async () => {
    await voicemailPage.ensureLoaded();
  });

  const telephoneDialog = app.homePage.telephonyDialog;
  if (await telephoneDialog.exists) {
    await telephoneDialog.clickMinimizeButton();
  }

  await ensuredOneVoicemail(t, caller, callee, app);

  const voicemailItem = voicemailPage.voicemailItemByNth(0);

  await h(t).withLog('When I play the first voicemail record', async () => {
    await voicemailItem.clickPlayButton();
  });


  await h(t).withLog('And voicemail is playing (pause button and current time exist)', async () => {
    await t.expect(voicemailItem.playButton.exists).notOk();
    await t.expect(voicemailItem.pauseButton.exists).ok({ timeout: 30e3 });
    await t.expect(voicemailItem.currentTimeSpan.exists).ok();
  });

  await h(t).withLog('When voicemail is play 100%', async () => {
    await t.expect(voicemailItem.playButton.exists).ok({ timeout: 60e3 });
  });

  await h(t).withLog('Then The slider current time will return back to 00:00', async () => {
    await t.hover(voicemailItem.self);
    await t.expect(voicemailItem.currentTimeSpan.textContent).eql('00:00');
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2221'],
  maintainers: ['Potar.He'],
  keywords: ['voicemail']
})('Switching the tab/page when playing the voicemail', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const callee = users[4];
  const caller = users[5];

  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click voicemail entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.phoneTab.voicemailEntry.enter();
  });

  await h(t).withLog('Then voicemail page should be open', async () => {
    await voicemailPage.ensureLoaded();
  });

  const telephoneDialog = app.homePage.telephonyDialog;
  if (await telephoneDialog.exists) {
    await telephoneDialog.clickMinimizeButton()
  }

  await ensuredOneVoicemail(t, caller, callee, app);

  const voicemailItem = voicemailPage.voicemailItemByNth(0);

  await h(t).withLog('When I play the first voicemail record', async () => {
    await voicemailItem.clickPlayButton();
  });


  await h(t).withLog('Then voicemail is playing (pause button and current time exist)', async () => {
    await t.expect(voicemailItem.playButton.exists).notOk();
    await t.expect(voicemailItem.pauseButton.exists).ok({ timeout: 30e3 });
    await t.expect(voicemailItem.currentTimeSpan.exists).ok();
    await t.wait(2e3);
  });

  await h(t).withLog('When I click call history entry', async () => {
    await app.homePage.phoneTab.callHistoryEntry.enter();
  });

  await h(t).withLog('And back to voicemail page', async () => {
    await app.homePage.phoneTab.voicemailEntry.enter();
  });

  await h(t).withLog('Then The voicemail pauses', async () => {
    await t.expect(voicemailItem.playButton.exists).ok();
    await t.expect(voicemailItem.endTimeSpan.exists).ok();
    await t.expect(voicemailItem.currentTimeSpan.exists).notOk();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2223'],
  maintainers: ['Potar.He'],
  keywords: ['voicemail']
})('Switching the tab/page when playing the voicemail', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const callee = users[4];
  const caller = users[5];

  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click voicemail entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.phoneTab.voicemailEntry.enter();
  });

  await h(t).withLog('Then voicemail page should be open', async () => {
    await voicemailPage.ensureLoaded();
  });

  const telephoneDialog = app.homePage.telephonyDialog;
  if (await telephoneDialog.exists) {
    await telephoneDialog.clickMinimizeButton()
  }

  let voicemailCount = await voicemailPage.items.count;
  if (voicemailCount < 2) {
    let callerSession = await h(t).newWebphoneSession(caller);
    await addVoicemail(t, callerSession, callee.extension, app, 30e3, 2 - voicemailCount);
  }

  const firstVoicemail = voicemailPage.voicemailItemByNth(0);
  const secondVoicemail = voicemailPage.voicemailItemByNth(1);


  await h(t).withLog('When I play the first voicemail record', async () => {
    await firstVoicemail.clickPlayButton();
  });


  await h(t).withLog('Then voicemail is playing (pause button and current time exist)', async () => {
    await t.expect(firstVoicemail.playButton.exists).notOk();
    await t.expect(firstVoicemail.pauseButton.exists).ok({ timeout: 30e3 });
    await t.expect(firstVoicemail.currentTimeSpan.exists).ok();
    await t.wait(1e3);
    await t.expect(firstVoicemail.currentTimeSpan.innerText).notEql('00:00');
  });

  await h(t).withLog('When I play the second voicemail', async () => {
    await secondVoicemail.clickPlayButton();
  });


  await h(t).withLog('Then The first voicemail pauses', async () => {
    await t.expect(firstVoicemail.playButton.exists).ok();
    await t.hover(firstVoicemail.self);
    await t.expect(firstVoicemail.currentTimeSpan.textContent).notEql('00:00');
  });
});
