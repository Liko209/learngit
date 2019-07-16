import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ensuredOneCallLog } from '../../fixtures/PhoneTab/CallHistory/utils';

fixture('Phone/CallHistory')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

  test(formalName('Check empty call history', ['P2', 'Phone', 'CallHistory' ,'Sean.Zhuang']), async (t) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    const otherUser = users[5];

    const app = new AppRoot(t);

    await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
    await h(t).withLog('When I click Phone entry of leftPanel and click call history entry', async () => {
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

    await ensuredOneCallLog(t, otherUser, loginUser, app);

    const callHistoryItem = callHistoryPage.callHistoryItemByNth(0);
    const callHistoryId = await callHistoryItem.id;
    await h(t).withLog('When I hover call history {id} and click "Delete" button', async (step) => {
      step.setMetadata('id', callHistoryId)
      await callHistoryItem.hoverSelf();
      if (!await callHistoryItem.deleteButton.exists) {
        await callHistoryItem.openMoreMenu();
      }
    });

    await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_MoreMenu' });

    await h(t).withLog('When I hover call history {id} and click "Delete" button', async (step) => {
      await callHistoryItem.clickDeleteButton();
    });

    const deleteCallHistoryDialog = app.homePage.deleteCallHistoryDialog;
    await h(t).withLog('Then the delete confirm dialog should be showed', async () => {
      await deleteCallHistoryDialog.ensureLoaded();
    });

    await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_DeleteCallHistory' });

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

    await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_EmptyCallHistory' });

  });
