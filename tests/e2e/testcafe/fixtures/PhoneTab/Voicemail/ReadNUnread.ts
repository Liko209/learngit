/*
 * @Author: Potar.He
 * @Date: 2019-04-08 14:34:14
 * Copyright © RingCentral. All rights reserved.
 */

import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta, IUser } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { WebphoneSession } from '../../../v2/webphone/session';

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


async function ensuredOneVoicemail(t: TestController, caller: IUser, callee: IUser, app) {
  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  const telephoneDialog = app.homePage.telephonyDialog;

  let hasVoicemail = await voicemailPage.items.count;
  if (hasVoicemail == 0) {
    await h(t).log('There is not any voicemail record. now make one voicemail...')
    let callerSession: WebphoneSession;
    await h(t).withLog('When I login webphone with {number}#{extension}', async (step) => {
      step.initMetadata({
        number: caller.company.number,
        extension: caller.extension
      })
      callerSession = await h(t).newWebphoneSession(caller);
    });

    await h(t).withLog('and caller session makeCall to callee', async () => {
      await callerSession.makeCall(`${callee.company.number}#${callee.extension}`);
    });

    await h(t).withLog('Then the telephone dialog should be popup', async () => {
      await telephoneDialog.ensureLoaded();
    });

    await h(t).withLog('When callee click "send to voicemail" button', async () => {
      await telephoneDialog.clickSendToVoiceMailButton();
    });

    const waitTime = 20e3;
    await h(t).withLog('and caller wait {time} seconds and hangup the call', async (step) => {
      step.setMetadata('time', (waitTime / 1000).toString());
      await t.wait(waitTime);
      await callerSession.hangup();
      await callerSession.waitForStatus('terminated');
    });

    await h(t).withLog('And refresh page', async () => {
      await t.wait(5e3);
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the voicemail page has one record', async (step) => {
      await t.expect(voicemailPage.items.count).eql(1, { timeout: 60e3 });
    });
  }
}

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2243', 'JPT-2244'],
  maintainers: ['Potar.He'],
  keywords: ['voicemail']
})('Click “Mark Read” action to mark read a VM. & Click “Mark Unread” action to mark unread a VM', async (t) => {
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
  const voicemailEntry = app.homePage.phoneTab.voicemailEntry;
  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click voicemail entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await voicemailEntry.enter();
  });

  await h(t).withLog('Then voicemail page should be open', async () => {
    await voicemailPage.ensureLoaded();
  });

  const telephoneDialog = app.homePage.telephonyDialog;
  if (await telephoneDialog.exists) {
    await telephoneDialog.clickMinimizeButton();
  }

  await ensuredOneVoicemail(t, caller, callee, app);

  let umiCount = 1;
  await h(t).withLog('And voicemail entry have umi: {count}', async (step) => {
    umiCount = await voicemailEntry.umi.count()
    step.setMetadata("count", umiCount.toString());
  });

  const markUnread = 'Mark Unread'
  const markRead = 'Mark Read'
  const voicemailItem = voicemailPage.voicemailItemByNth(0);

  let isRead: boolean;
  await h(t).withLog('When I check the first voicemail read status is {status}', async (step) => {
    await voicemailItem.openMoreMenu();
    isRead = await voicemailItem.readToggleButton.textContent == markUnread;
    step.setMetadata("status", isRead ? 'read' : 'Unread');
  });

  if (isRead) {
    await h(t).withLog('And I click "{markUnread}" button', async (step) => {
      step.setMetadata('markUnread', markUnread)
      await voicemailItem.clickReadToggle();
    });
    await h(t).withLog('Then the Umi should be +1: {umiCount}', async (step) => {
      step.setMetadata('umiCount', (umiCount + 1).toString())
      await voicemailEntry.umi.shouldBeNumber(umiCount + 1);
    });

    await h(t).withLog('When I open more menu', async () => {
      await voicemailItem.openMoreMenu();

    });
    await h(t).withLog('Then the read toggle change to "{markRead}"', async (step) => {
      step.setMetadata('markRead', markRead)
      await t.expect(voicemailItem.readToggleButton.textContent).eql(markRead);
    });

    await h(t).withLog('And I click "{markRead}" button', async (step) => {
      step.setMetadata('markRead', markRead)
      await voicemailItem.clickReadToggle();
    });
    await h(t).withLog('Then the Umi should be: {umiCount}', async (step) => {
      step.setMetadata('umiCount', umiCount.toString())
      await voicemailEntry.umi.shouldBeNumber(umiCount);
    });

  } else {
    await h(t).withLog('And I click "{markRead}" button', async (step) => {
      step.setMetadata('markRead', markRead)
      await voicemailItem.clickReadToggle();
    });
    await h(t).withLog('Then the Umi should be -1: {umiCount}', async (step) => {
      step.setMetadata('umiCount', (umiCount - 1).toString())
      await voicemailEntry.umi.shouldBeNumber(umiCount - 1);
    });

    await h(t).withLog('When I open more menu', async () => {
      await voicemailItem.openMoreMenu();

    });
    await h(t).withLog('Then the read toggle change to "{markUnread}"', async (step) => {
      step.setMetadata('markUnread', markUnread)
      await t.expect(voicemailItem.readToggleButton.textContent).eql(markUnread);
    });

    await h(t).withLog('And I click "{markUnread}" button', async (step) => {
      step.setMetadata('markUnread', markUnread)
      await voicemailItem.clickReadToggle();
    });

    await h(t).withLog('Then the Umi should be: {umiCount}', async (step) => {
      step.setMetadata('umiCount', umiCount.toString())
      await voicemailEntry.umi.shouldBeNumber(umiCount);
    });
  }
});
