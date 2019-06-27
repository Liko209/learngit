/*
 * @Author: Potar.He
 * @Date: 2019-06-06 09:53:59
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2019-06-26 09:12:52
 */

import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { ensuredOneCallLog } from './utils';

fixture('Phone/callHistory')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2340'],
  maintainers: ['Skye.Wang'],
  keywords: ['callHistory']
})('Delete all call history', async (t) => {
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
  const deleteAllCalllDialog = app.homePage.deleteAllCalllDialog;
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

  await ensuredOneCallLog(t, caller, callee, app);


  await h(t).withLog('When I click more icon in the page head', async (step) => {
    await callHistoryPage.clickMoreIcon();
  });

  await h(t).withLog('And when I click delete all call history button', async (step) => {
    await callHistoryPage.clickDeleteAllCallButton();
  });

  await h(t).withLog('Then the delete confirm dialog should be showed', async () => {
    await deleteAllCalllDialog.ensureLoaded();
  });

  await h(t).withLog('When I click delete button ', async () => {
    await deleteAllCalllDialog.clickDeleteButton();
  });

  await h(t).withLog('Then the history should be cleared and display wmpty page', async () => {
    await t.expect(callHistoryPage.emptyPage.exists).ok();
  });

});
