/*
 * @Author: Skye Wang (skye.wang@ringcentral.com)
 * @Date: 2019-07-26 10:14:54
 * Copyright © RingCentral. All rights reserved.
 */
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('CustomStatus/SetCustomStatus')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-2784'],
  priority: ['P0'],
  maintainers: ['skye.wang'],
  keywords: ['customStatus']
})('Can set custom status', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).scenarioHelper.resetProfile(loginUser);
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const setCustomStatus = 'Be late'
  const settingMenu = app.homePage.settingMenu;
  const shareStatusDialog = app.homePage.ShareStatusDialog;
  

  await h(t).withLog('When I set my status to "Out of office" ' , async () => {
    await app.homePage.openSettingMenu();
    if (!await settingMenu.shareStatusButton.exists) {
      await settingMenu.clickClearStatusButton();
    }
    await settingMenu.clickShareStatusButton();

    await shareStatusDialog.ensureLoaded();
    await shareStatusDialog.clickTheFirstCustomItem();
    await shareStatusDialog.clickSaveButton();
  });

  await h(t).withLog('Then the dialog closed ' , async () => {
    await shareStatusDialog.ensureDismiss();

  });

  const status1 = 'Out of office';
  await h(t).withLog('And display "Clear status" and "Out of office" button ' , async () => {
    await app.homePage.openSettingMenu();
    await settingMenu.clearStatusButton.exists;
    await settingMenu.statusButton.exists;
    await t.expect(settingMenu.statusButton.withText(status1).exists).ok(); 


  });

  await h(t).withLog('When I click status button to reopen the share status dialog' , async () => {
    await settingMenu.clickStatusButton();
    await shareStatusDialog.ensureLoaded();

  });

  const emojiLibrary = app.homePage.messageTab.emojiLibrary;
  let emojiValue: string
  let emojis = [];

  await h(t).withLog('And when I clear the status and manual input a new status ' , async () => {
    await shareStatusDialog.clickClearButton();
    await shareStatusDialog.typeStatusKeyword(setCustomStatus);
    await shareStatusDialog.clickEmojiButton();
    await emojiLibrary.ensureLoaded();
    emojiValue = await emojiLibrary.smileysAndPeopleSection.nthEmojiItem(0).getValue();
    await emojiLibrary.smileysAndPeopleSection.clickEmojiByNth(0);
    emojis.push(emojiValue);
    await emojiLibrary.ensureDismiss();
    await shareStatusDialog.clickSaveButton();
  });

  await h(t).withLog('Then the dialog closed ' , async () => {
    await shareStatusDialog.ensureDismiss();

  });

  const status2 = 'Be late';
  await h(t).withLog('And the status change to "Be late" ' , async () => {
    await app.homePage.openSettingMenu();
    await t.expect(settingMenu.statusButton.withText(status2).exists).ok(); 
  });

  await h(t).withLog('When I clear status via click "Clear status" button ' , async () => {
    // await app.homePage.openSettingMenu();
    await settingMenu.clickClearStatusButton();
  });

  await h(t).withLog('Then only display the "Share status" button ' , async () => {
    await app.homePage.openSettingMenu();
    await settingMenu.shareStatusButton.exists
    await t.expect(settingMenu.clearStatusButton.exists).notOk();
  });

});