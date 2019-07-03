/*
 * @Author: allen.lian
 * @Date: 2019-07-01 08:51:53
 * Copyright © RingCentral. All rights reserved.
 */


import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';

import * as assert from 'assert';
import { addOneCallLogFromGuest } from './utils';

fixture('call history')
  .beforeEach(setupCase(BrandTire.RC_WITH_GUESS_DID))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2408', 'JPT-2409'],
  maintainers: ['Allen.Lian'],
  keywords: ['callHistory'],
})('Block the number (call log)', async (t) => {
  const callee = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.guestCompany.users[1];

  const title = 'Block this number';
  const text = 'This number will not be able to reach you if blocked. Do you want to block it?';
  const cancelButtonText = 'Cancel';
  const blockButtonText = 'Block';
  const blocknumber = '#icon-blocked';
  const unblocknumber = '#icon-unblocked';
  const alertText1 = 'The number has been blocked';
  const alertText2 = 'The number has been unblocked';

  await h(t).withLog('Given I reset callee {number}#{extension} profile, state and allow all phone number', async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    });
    await h(t).glip(callee).init();
    await h(t).glip(callee).setDefaultPhoneApp('glip');
    await h(t).platform(callee).resetBlockPhoneNumber();
  });

  const app = new AppRoot(t);
  await h(t).withLog('And I login Jupiter with callee {number}#{extension}', async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    }),
      await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  const CallHistoryPage = app.homePage.phoneTab.callHistoryPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click Call history entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.phoneTab.callHistoryEntry.enter();
  });

  await h(t).withLog('Then call history page should be open', async () => {
    await CallHistoryPage.ensureLoaded();
  });

  const telephoneDialog = app.homePage.telephonyDialog;
  if (await telephoneDialog.exists) {
    await telephoneDialog.clickMinimizeButton();
  }

  await addOneCallLogFromGuest(t, caller, callee, app);

  const callhistoryItem = CallHistoryPage.callHistoryItemByNth(0);
  const callhistoryId = await callhistoryItem.id;

  await h(t).withLog('When I hover call history {id} and click "Block number" button', async (step) => {
    step.setMetadata('id', callhistoryId);
    await callhistoryItem.hoverSelf();
    if (!await callhistoryItem.blockToggle.exists) {
      await callhistoryItem.openMoreMenu();
    }
    await callhistoryItem.clickBlockButton();
  });

  const BlockNumberDialog = app.homePage.blockNumberDialog;
  await h(t).withLog('Then the block confirm dialog should be showed', async () => {
    await BlockNumberDialog.ensureLoaded();
  });

  await h(t).withLog('And title: {title}', async (step) => {
    step.setMetadata('title', title);
    await t.expect(BlockNumberDialog.title.textContent).eql(title);
  });

  await h(t).withLog('And text: {text}', async (step) => {
    step.setMetadata('text', text);
    await t.expect(BlockNumberDialog.content.textContent).eql(text);
  });

  await h(t).withLog('And cancel button: {cancel}', async (step) => {
    step.setMetadata('cancel', cancelButtonText);
    await t.expect(BlockNumberDialog.cancelButton.textContent).eql(cancelButtonText);
  });

  await h(t).withLog('And cancel button: {delete}, color: {red}', async (step) => {
    step.initMetadata({ block: blockButtonText, red: 'red' });
    await t.expect(BlockNumberDialog.blockButton.textContent).eql(blockButtonText);
    const style = await BlockNumberDialog.blockButton.style;
    assert.ok(style['background-color'] == 'rgb(244, 67, 54)', 'block button background not eql specify: rgb(244, 67, 54)');
  });

  await h(t).withLog('When I click Cancel button ', async () => {
    await BlockNumberDialog.clickCancelButton();
  });

  await h(t).withLog('Then the block confirm dialog dismiss', async () => {
    await t.expect(BlockNumberDialog.exists).notOk();
  });

  await h(t).withLog('When I open hover call history {id} and click "Block number" button', async (step) => {
    step.setMetadata('id', callhistoryId);
    await callhistoryItem.hoverSelf();
    if (!await callhistoryItem.blockToggle.exists) {
      await callhistoryItem.openMoreMenu();
    }
    await callhistoryItem.clickBlockButton();
  });

  await h(t).withLog('Then the block confirm dialog should be showed', async () => {
    await BlockNumberDialog.ensureLoaded();
  });

  await h(t).withLog('When I click block button', async () => {
    await BlockNumberDialog.clickBlockButton();
  });

  await h(t).withLog('Then the block confirm dialog should dismiss', async () => {
    await BlockNumberDialog.ensureDismiss();
  });

  await h(t).withLog(`And there should be success flash toast (short = 3s) displayed "${alertText1}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText1);
  });

  await h(t).withLog('Block button changed to Unblock button', async (step) => {
    step.setMetadata('id', callhistoryId);
    await callhistoryItem.openMoreMenu();
    await t.expect(callhistoryItem.unblockButton.exists).ok();
    await callhistoryItem.openMoreMenu();
  });

  await h(t).withLog('When I hover call history {id} and click "Unblock number" button', async (step) => {
    step.setMetadata('id', callhistoryId);
    await callhistoryItem.hoverSelf();
    if (!await callhistoryItem.blockToggle.exists) {
      await callhistoryItem.openMoreMenu();
    }
    await callhistoryItem.clickUnblockButton();
  });

  await h(t).withLog(`And there should be success flash toast (short = 3s) displayed "${alertText2}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText2);
  });

  await h(t).withLog('Block button changed to Unblock button', async (step) => {
    step.setMetadata('id', callhistoryId);
    await callhistoryItem.openMoreMenu();
    await t.expect(callhistoryItem.blockButton.exists).ok();
  });
});
