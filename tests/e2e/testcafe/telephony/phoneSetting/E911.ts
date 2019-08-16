import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from "../../v2/models";
import { WebphoneSession } from 'webphone-client';


fixture('Phone/emergency address')
  .beforeEach(setupCase(BrandTire.DID_WITH_MULTI_REGIONS))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['p0'],
  caseIds: ['JPT-2692'],
  maintainers: ['potar.he'],
  keywords: ['E911', 'emergency address']
})('Check user can confirm emergency address successfully', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];


  const usStreet = '13 Elm Street';

  const confirmMessage = 'To enable outbound calls outside your organization, confirm your emergency address.'
  const alertMessage = 'E911 Service may be limited or unavailable. Your specific location may not be automatically communicated to the dispatcher.'

  const anotherCountry = 'China';
  let targePhoneNumber = '88888888'

  // test env call to DID
  // const anotherUser = users[1];

  // let targePhoneNumber, webphoneSession: WebphoneSession;
  // await h(t).withLog('When I click confirm button', async () => {
  //   await h(t).platform(anotherUser).init()
  //   const res = await h(t).platform(anotherUser).getExtensionPhoneNumberList().then(res => {
  //     const record = res.data.records.filter(item => item['usageType'] != 'DirectNumber')[0];
  //     targePhoneNumber = record['phoneNumber']
  //   });
  //   webphoneSession = await h(t).newWebphoneSessionWithDid(targePhoneNumber, anotherUser.password);
  // });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded(undefined, undefined, false);
  });

  const alertDialog = app.homePage.alertDialog;
  await h(t).withLog('Then alert dialog should show {confirmMessage}', async (step) => {
    step.setMetadata('confirmMessage', confirmMessage);
    // await alertDialog.shouldBeShowMessage(confirmMessage);
    await t.expect(alertDialog.message.withText(confirmMessage).exists).ok();
  });

  await h(t).withLog('When I click confirm button', async () => {
    await alertDialog.clickConfirmAddressButton();
  });

  const addressConfirm = app.homePage.addressConfirmDialog;
  await h(t).withLog('Then Emergency address confirm dialog should be popup', async () => {
    await addressConfirm.ensureLoaded();
  });

  await h(t).withLog('Then Emergency address confirm dialog should be popup', async () => {
    await addressConfirm.typeRandomTextInEveryField();
  });

  await h(t).withLog('When I click cancel button', async () => {
    await addressConfirm.clickCancelButton();
  });

  await h(t).withLog('Then the confirm dialog should disappear', async () => {
    await addressConfirm.ensureDismiss();
  });

  const settingTab = app.homePage.settingTab;
  await h(t).withLog('When I open region setting', async () => {
    await app.homePage.leftPanel.settingsEntry.enter();
    await settingTab.phoneEntry.enter();
    await settingTab.phoneSettingPage.clickRegionUpdateButton();
  });

  const updateRegionDialog = settingTab.phoneSettingPage.updateRegionDialog;
  await h(t).withLog('And select another country : {anotherCountry}', async (step) => {
    step.setMetadata('anotherCountry', anotherCountry)
    await updateRegionDialog.clickCountryDropDown();
    await updateRegionDialog.selectCountryWithText(anotherCountry);
    await updateRegionDialog.clickSaveButton();
  });
  await h(t).withLog('Then region dialog should disappear', async () => {
    await updateRegionDialog.ensureDismiss();
  });

  await h(t).withLog('And address confirm dialog should be popup', async () => {
    await addressConfirm.ensureLoaded(15e3);
    // here have a backend bug in test Env. so need a fixed street address.
    await t.typeText(addressConfirm.streetAddress, usStreet, { replace: true, paste: true });
    await t.expect(addressConfirm.self.find('input[type="checkbox"]').exists).ok();
  });

  await h(t).withLog('And the confirm button should be disabled', async () => {
    await addressConfirm.expectConfirmButtonDisabled();
  });

  await h(t).withLog('When I check all disclaimers', async (t) => {
    await addressConfirm.checkAllDisclaimerCheckBox()
  });

  await h(t).withLog('Then the confirm button should be enabled', async () => {
    await addressConfirm.expectConfirmButtonEnabled();
  });

  await h(t).withLog('When I click confirm button', async () => {
    await addressConfirm.clickConfirmButton();
  });

  await h(t).withLog('Then the confirm dialog should disappear', async () => {
    await addressConfirm.ensureDismiss();
  });

  await h(t).withLog('When I logout and login agarin', async () => {
    await app.homePage.logout();
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded(undefined, undefined, false);
  });

  await h(t).withLog('Then the address confirm alert dialog should not appear', async () => {
    await t.expect(alertDialog.message.withText(confirmMessage).exists).notOk();
  });

  await h(t).withLog('When I Open dialer', async (t) => {
    await app.homePage.openDialer(false);
    await app.homePage.telephonyDialog.ensureLoaded();
  });

  const emergencyPromptDialog = app.homePage.emergencyConfirmDialog;
  await h(t).withLog('Then should pop a alert: {alertMessage}', async (step) => {
    step.setMetadata('alertMessage', alertMessage);
    await t.expect(emergencyPromptDialog.dialogContent.withText(alertMessage).exists).ok();
  });

  const telephonyDialog = app.homePage.telephonyDialog
  await h(t).withLog('When I close this alert and call a DID number {targePhoneNumber}', async (step) => {
    step.setMetadata('targePhoneNumber', targePhoneNumber);
    await emergencyPromptDialog.clickEmergencyConfirmOkButton();
    await telephonyDialog.typeTextInDialer(targePhoneNumber);
    await t.wait(2e3);
    await telephonyDialog.hitEnterToMakeCall();
  });

  await h(t).withLog('The call can be call out directly and cannot see the E911 alert', async () => {
    // await webphoneSession.waitForStatus('invited');
    await t.wait(2e3);
    await t.expect(emergencyPromptDialog.dialogContent.withText(alertMessage).exists).notOk();
  });

});

test.meta(<ITestMeta>{
  priority: ['p1'],
  caseIds: ['JPT-2637'],
  maintainers: ['joy.zhang'],
  keywords: ['E911', 'emergency address']
})('Show alert to confirm emergency address when user opens dialer', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];

  const title = 'Alert';
  const confirmButtonText = 'Confirm emergency address';
  const confirmMessage = 'You emergency address is unknown. You are limited to making outbound calls to extensions in your organization only.'

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded(undefined, undefined, false);
  });

  const alertDialog = app.homePage.alertDialog;
  await h(t).withLog('Then I dismiss alert toast', async (step) => {
    await alertDialog.clickDismissButton();
  });

  await h(t).withLog('When I Open dialer', async () => {
    await app.homePage.openDialer(false);
    await app.homePage.telephonyDialog.ensureLoaded();
  });

  const emergencyConfirmDialog = app.homePage.emergencyConfirmDialog;
  await h(t).withLog('Then the alert confirm dialog should be showed', async () => {
    await emergencyConfirmDialog.ensureLoaded();
  });

  await h(t).withLog('And title: {title}', async (step) => {
    step.setMetadata('title', title);
    await t.expect(emergencyConfirmDialog.title.textContent).eql(title);
  });

  await h(t).withLog('And confirmMessage: {confirmMessage}', async (step) => {
    step.setMetadata('confirmMessage', confirmMessage);
    await t.expect(emergencyConfirmDialog.dialogContent.textContent).eql(confirmMessage);
  });

  await h(t).withLog('And close button', async () => {
    await t.expect(emergencyConfirmDialog.closeButton.exists).ok();
  });

  await h(t).withLog('And confirmButton button: {confirmButtonText}', async (step) => {
    step.setMetadata('confirmButtonText', confirmButtonText);
    await t.expect(emergencyConfirmDialog.emergencyConfirmOkButton.textContent).eql(confirmButtonText);
  });

  await h(t).withLog('When I click confirm button', async () => {
    await emergencyConfirmDialog.clickEmergencyConfirmOkButton();
  });

  const addressConfirm = app.homePage.addressConfirmDialog;
  await h(t).withLog('Then Emergency address confirm dialog should be popup', async () => {
    await addressConfirm.ensureLoaded();
  });

  await h(t).withLog('When I click cancel button', async () => {
    await addressConfirm.clickCancelButton();
  });

  await h(t).withLog('Then the confirm dialog should close', async () => {
    await addressConfirm.ensureDismiss();
  });

  await h(t).withLog('When I close and open dialer again', async () => {
    await app.homePage.telephonyDialog.clickMinimizeButton();
    await app.homePage.telephonyDialog.ensureDismiss();
    await app.homePage.openDialer(false);
    await app.homePage.telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('Then the alert dialog should not popup', async () => {
    await emergencyConfirmDialog.ensureDismiss();
  });

  await h(t).withLog('When I re-login and open dialer again', async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, loginUser)
    await app.homePage.openDialer(false);
  });

  const emergencyPromptDialog = app.homePage.emergencyConfirmDialog;
  await h(t).withLog('Then the alert confirm dialog should be showed', async () => {
    await emergencyPromptDialog.ensureLoaded();
  });
})
