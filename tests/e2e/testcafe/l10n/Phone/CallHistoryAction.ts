import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ensuredOneCallLog } from '../../fixtures/PhoneTab/CallHistory/utils';

fixture('Phone/CallHistoryAction')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

  test(formalName('Check call history action tips and delete call log popup', ['P2', 'Phone', 'CallHistory' ,'Sean.Zhuang']), async (t) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = h(t).rcData.mainCompany.users[4];
    const guestUser = h(t).rcData.guestCompany.users[5];


    const app = new AppRoot(t);

    await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
    const telephoneDialog = app.homePage.telephonyDialog;

    await h(t).withLog('When I click Phone entry of leftPanel and click call history entry', async () => {
      await app.homePage.leftPanel.phoneEntry.enter();
      await app.homePage.phoneTab.callHistoryEntry.enter();
    });

    await h(t).withLog('And minimize phone dialog',async()=>{
      if (await telephoneDialog.exists) {
        await telephoneDialog.clickMinimizeButton()
      }
    })

    await h(t).withLog('Then call history page should be open', async () => {
      await callHistoryPage.ensureLoaded();
    });

    await h(t).withLog('When there\'s a call log' ,async()=>{
      await ensuredOneCallLog(t, guestUser, loginUser, app);
    })

    const callHistoryItem = callHistoryPage.callHistoryItemByNth(0);
    await h(t).withLog('And I hover "Call" button', async () => {
      await callHistoryItem.hoverCallBackButton();
    });

    await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_CallBackButton' });

    await h(t).withLog('And I hover "Message" button', async () => {
      await callHistoryItem.hoverMessageButton();
    });

    await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_MessageButton' });

    await h(t).withLog('And I hover "Delete" button', async () => {
      await callHistoryItem.hoverDeleteButton();
    });

    await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_DeleteButton' });

    await h(t).withLog('When I click "Delete" button', async () => {
      await callHistoryItem.clickDeleteButton();
    });

    const deleteCallHistoryDialog = app.homePage.deleteCallHistoryDialog;
    await h(t).withLog('Then the delete confirm dialog should be showed', async () => {
      await deleteCallHistoryDialog.ensureLoaded();
    });

    await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_Phone_DeleteCallLog' });
});
