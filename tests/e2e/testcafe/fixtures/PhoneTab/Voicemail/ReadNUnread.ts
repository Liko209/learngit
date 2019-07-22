/*
 * @Author: Potar.He
 * @Date: 2019-04-08 14:34:14
 * Copyright © RingCentral. All rights reserved.
 */

import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { ensuredOneVoicemail } from './utils';

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


async function clickReadNUnreadButton(voicemailItem) {
  await voicemailItem.hoverSelf();
  if (!await voicemailItem.readToggleButton.exists) {
    await voicemailItem.openMoreMenu();
  }
  await voicemailItem.clickReadToggle();
}

async function isReadButton(voicemailItem) {
  await voicemailItem.hoverSelf();
  if (!await voicemailItem.readToggleButton.exists) {
    await voicemailItem.openMoreMenu();
  }
  if (await voicemailItem.readButton.exists) {
    return true;
  }
  return false;
}

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2243', 'JPT-2244'],
  maintainers: ['Potar.He'],
  keywords: ['voicemail']
})('Click “Mark Read” action to mark read a VM. & Click “Mark as unread” action to mark unread a VM', async (t) => {
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

  const markUnread = 'Mark as unread'
  const markRead = 'Mark as read'
  const voicemailItem = voicemailPage.voicemailItemByNth(0);

  let isRead: boolean;
  await h(t).withLog('When I check the first voicemail read status is {status}', async (step) => {
    isRead = await isReadButton(voicemailItem);
    step.setMetadata("status", isRead ? 'read' : 'Unread');
  });

  if (isRead) {
    await h(t).withLog('And I click "{markUnread}" button', async (step) => {
      step.setMetadata('markUnread', markUnread)
      await clickReadNUnreadButton(voicemailItem);
    });
    await h(t).withLog('Then the Umi should be +1: {umiCount}', async (step) => {
      step.setMetadata('umiCount', (umiCount + 1).toString())
      await voicemailEntry.umi.shouldBeNumber(umiCount + 1);
    });

    await h(t).withLog('Then the read toggle change to "{markRead}"', async (step) => {
      step.setMetadata('markRead', markRead)
      await t.expect(await isReadButton(voicemailItem)).eql(false);
    });

    await h(t).withLog('And I click "{markRead}" button', async (step) => {
      step.setMetadata('markRead', markRead)
      await clickReadNUnreadButton(voicemailItem);
    });
    await h(t).withLog('Then the Umi should be: {umiCount}', async (step) => {
      step.setMetadata('umiCount', umiCount.toString())
      await voicemailEntry.umi.shouldBeNumber(umiCount);
    });
  } else {
    await h(t).withLog('And I click "{markRead}" button', async (step) => {
      step.setMetadata('markRead', markRead)
      await clickReadNUnreadButton(voicemailItem);
    });
    await h(t).withLog('Then the Umi should be -1: {umiCount}', async (step) => {
      step.setMetadata('umiCount', (umiCount - 1).toString())
      await voicemailEntry.umi.shouldBeNumber(umiCount - 1);
    });

    await h(t).withLog('Then the read toggle change to "{markUnread}"', async (step) => {
      step.setMetadata('markUnread', markUnread)
      await t.expect(await isReadButton(voicemailItem)).eql(true);
    });

    await h(t).withLog('And I click "{markUnread}" button', async (step) => {
      step.setMetadata('markUnread', markUnread)
      await clickReadNUnreadButton(voicemailItem);
    });

    await h(t).withLog('Then the Umi should be: {umiCount}', async (step) => {
      step.setMetadata('umiCount', umiCount.toString())
      await voicemailEntry.umi.shouldBeNumber(umiCount);
    });
  }
});
