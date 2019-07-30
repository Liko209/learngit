import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { h } from "../../v2/helpers";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { addOneMissCallLogFromAnotherUser } from "../../fixtures/PhoneTab/CallHistory/utils";
import { formalName } from "../../libs/filter";

fixture('Phone/BlockAndUnblock')
  .beforeEach(setupCase(BrandTire.RC_WITH_GUESS_DID))
  .afterEach(teardownCase());

test(formalName('Check block and unblock', ['P2', 'Phone', 'BlockAndUnblock', 'V1.6', 'Sean.Zhuang']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const guestUser = h(t).rcData.guestCompany.users[1];

  await h(t).withLog('Given I reset profile, state and allow all phone number', async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).setDefaultPhoneApp('glip');
    await h(t).platform(loginUser).deleteALlBlockOrAllowPhoneNumber();
  });

  const app = new AppRoot(t);
  await h(t).withLog('And I login Jupiter', async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
  const telephoneDialog = app.homePage.telephonyDialog;
  const deleteAllCallDialog = app.homePage.deleteAllCalllDialog;

  await h(t).withLog('When I enter call history and minimize phone dialog', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.phoneTab.callHistoryEntry.enter();
    if (await telephoneDialog.exists) {
      await telephoneDialog.clickMinimizeButton();
    }
  });

  await h(t).withLog('Then call history page should be open', async () => {
    await callHistoryPage.ensureLoaded();
  });

  await h(t).withLog('When I clear call history ', async () => {
    if(!await callHistoryPage.emptyPage.exists){
      await callHistoryPage.clickMoreIcon();
      await callHistoryPage.clickDeleteAllCallButton();
      await deleteAllCallDialog.clickDeleteButton();
    }
  });

  await h(t).withLog('And the guestUser call to loginUser', async () => {
    await addOneMissCallLogFromAnotherUser(t, guestUser, loginUser, app);
  });

  const callHistoryItem = callHistoryPage.callHistoryItemByNth(0);
  const blockNumberDialog = app.homePage.blockNumberDialog;

  await h(t).withLog('And I hover call history and click "Block number" button', async () => {
    await callHistoryItem.hoverSelf();
    await callHistoryItem.clickBlockButton();
  });

  await h(t).withLog('Then the block confirm dialog should be showed', async () => {
    await blockNumberDialog.ensureLoaded();
  });

  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_Phone_BlockConfirm' });

  await h(t).withLog('When I click block button', async () => {
    await blockNumberDialog.clickBlockButton();
  });

  await h(t).withLog('And I hover call history and hover "Unblock number" button', async () => {
    await callHistoryItem.hoverSelf();
    await callHistoryItem.hoverUnblockButton();
  });

  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_UnblockNumber' });

  await h(t).withLog('When I hover call history and click "Unblock number" button', async () => {
    await callHistoryItem.hoverSelf();
    await callHistoryItem.clickUnblockButton();
  });

  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_BlockNumber' });
});
