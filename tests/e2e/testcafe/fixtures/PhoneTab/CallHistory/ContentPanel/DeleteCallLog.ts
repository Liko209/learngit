/*
 * @Author: Potar.He
 * @Date: 2019-06-06 09:53:59
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-07-17 13:02:55
 */

import { BrandTire, SITE_URL } from '../../../../config';
import { setupCase, teardownCase } from '../../../../init';
import { h } from '../../../../v2/helpers';
import { ITestMeta } from '../../../../v2/models';
import { AppRoot } from '../../../../v2/page-models/AppRoot';
import { ensuredOneMissCallLog } from '../utils';

fixture('Phone/callHistory')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2357'],
  maintainers: ['Skye.Wang'],
  keywords: ['callHistory']
})('Delete a call history', async (t) => {
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

  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click call log entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.phoneTab.callHistoryEntry.enter();
  });

  await h(t).withLog('Then call history page should be open', async () => {
    await callHistoryPage.ensureLoaded();
  });

  const telephoneDialog = app.homePage.telephonyDialog;
  if (await telephoneDialog.exists) {
    await telephoneDialog.clickMinimizeButton()
  }

  await ensuredOneMissCallLog(t, caller, callee, app);

  const callHistoryItem = callHistoryPage.callHistoryItemByNth(0);
  const callHistoryId = await callHistoryItem.id;
  await h(t).withLog('When I hover call history {id} and click "Delete" button', async (step) => {
    step.setMetadata('id', callHistoryId)
    await callHistoryItem.hoverSelf();
    if (!await callHistoryItem.deleteButton.exists) {
      await callHistoryItem.openMoreMenu();
    }
    await callHistoryItem.clickDeleteButton();
  });

  const deleteCallHistoryDialog = app.homePage.deleteCallHistoryDialog;
  await h(t).withLog('Then the delete confirm dialog should be showed', async () => {
    await deleteCallHistoryDialog.ensureLoaded();
  });

  await h(t).withLog('When I click cancle button ', async () => {
    await deleteCallHistoryDialog.clickCancelButton();
  });

  await h(t).withLog('Then the delete confirm dialog should dismiss', async () => {
    await deleteCallHistoryDialog.ensureDismiss();
  });

  await h(t).withLog('When I hover call history {id} and click "Delete" button', async (step) => {
    step.setMetadata('id', callHistoryId)
    await callHistoryItem.hoverSelf();
    if (!await callHistoryItem.deleteButton.exists) {
      await callHistoryItem.openMoreMenu();
    }
    await callHistoryItem.clickDeleteButton();
  });

  await h(t).withLog('Then the delete confirm dialog should be showed', async () => {
    await deleteCallHistoryDialog.ensureLoaded();
  });

  await h(t).withLog('When I click delete button ', async () => {
    await deleteCallHistoryDialog.clickDeleteButton();
  });

  await h(t).withLog('Then the delete confirm dialog should dismiss', async () => {
    await deleteCallHistoryDialog.ensureDismiss();
  });

  await h(t).withLog('And the call history should be deleted', async () => {
    await callHistoryPage.callHistoryItemById(callHistoryId).ensureDismiss();
  });

});

