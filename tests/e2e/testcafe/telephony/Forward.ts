/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-06-05 15:38:58
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta } from '../v2/models';
import { ContactSearchList } from '../v2/page-models/AppRoot/HomePage/TelephonyDialog';
import { E911Address } from './e911address';

fixture('Telephony/Forward')
.beforeEach(setupCase(BrandTire.RC_WITH_PHONE))
.afterEach(teardownCase());

// skip this case due to currently SDET do not support forward list account so this case will be pending

// test.meta(<ITestMeta>{
//   caseIds: ['JPT-2114'],
//   priority: ['P2'],
//   maintainers: ['shining.miao'],
//   keywords: ['Forward']
// })('Should forward call successfully by forward number list', async (t) => {
//   const loginUser = h(t).rcData.mainCompany.users[0];
//   const caller = h(t).rcData.mainCompany.users[1];
//   const forwarder = h(t).rcData.mainCompany.users[2];
//   const app = new AppRoot(t);
//   const callerWebPhone = await h(t).newWebphoneSession(caller);
//   const forwarderWebPhone = await h(t).newWebphoneSession(forwarder);

//   await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
//     await h(t).directLoginWithUser(SITE_URL, loginUser);
//     await app.homePage.ensureLoaded();
//   });

//   await h(t).withLog('When I call this extension', async () => {
//     await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
//   });

//   const telephonyDialog = app.homePage.telephonyDialog;
//   await h(t).withLog('Then telephony dialog is displayed', async () => {
//     await telephonyDialog.ensureLoaded();
//   });

//   await h(t).withLog('Then I click more options button', async () => {
//     await telephonyDialog.clickMoreOptionsButton();
//   });

//   await h(t).withLog('Then I hover forward options', async () => {
//     await telephonyDialog.hoverForwardButton();
//   });

//   await h(t).withLog('Then I click forward list first item', async () => {
//     await telephonyDialog.clickForwardListFirstButton();
//   });

//   await h(t).withLog('Then telephony dialog should dismiss', async () => {
//     await telephonyDialog.ensureDismiss();
//   });

//   await h(t).withLog('Then forwarder dialog should displayed', async () => {
//     await forwarderWebPhone.waitForStatus('terminated');
//   });

//   await h(t).withLog('When callerUser hangup the call', async () => {
//     await callerWebPhone.hangup();
//   });

//   await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
//     await callerWebPhone.waitForStatus('terminated');
//   });
// });


test.meta(<ITestMeta>{
  caseIds: ['JPT-2146'],
  priority: ['P2'],
  maintainers: ['shining.miao'],
  keywords: ['Forward']
})('Should the tooltip "Forward" of "Forward" button in Forward page', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const tooltipText = 'Forward';
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('Then I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('Then I hover forward options', async () => {
    await telephonyDialog.hoverForwardButton();
  });

  await h(t).withLog('Then I click custom forward button', async () => {
    await telephonyDialog.clickCustomForwardButton();
  });

  await h(t).withLog('When I hover on the to forward action button', async () => {
    await telephonyDialog.hoverForwardActionButton();
  });

  await h(t).withLog(`Then Display a tooltip: '${tooltipText}`, async () => {
    await telephonyDialog.showTooltip(tooltipText);
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2140'],
  priority: ['P2'],
  maintainers: ['shining.miao'],
  keywords: ['Forward']
})('Call invalid forward number should prompt toast', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('Then I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('Then I hover forward options', async () => {
    await telephonyDialog.hoverForwardButton();
  });

  await h(t).withLog('Then I click custom forward button', async () => {
    await telephonyDialog.clickCustomForwardButton();
  });

  await h(t).withLog('When I click on the to forward action button', async () => {
    await telephonyDialog.clickForwardActionButton();
  });

  const alertText = 'The phone number entered is invalid. Check the number and try again.'
  await h(t).withLog(`And there should be fail flash toast (short = 2s) displayed "${alertText}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2070'],
  priority: ['P2'],
  maintainers: ['shining.miao'],
  keywords: ['Forward']
})('Should forward call successfully by custom forward', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  const caller = h(t).rcData.mainCompany.users[1];
  const forwarder = h(t).rcData.mainCompany.users[2];
  const app = new AppRoot(t);
  const callerWebPhone = await h(t).newWebphoneSession(caller);
  const forwarderWebPhone = await h(t).newWebphoneSession(forwarder);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('And I hover forward options', async () => {
    await telephonyDialog.hoverForwardButton();
  });

  await h(t).withLog('And I click custom forward button', async () => {
    await telephonyDialog.clickCustomForwardButton();
  });

  await h(t).withLog('Then the forward title should exist', async () => {
    const title = "Forward Call"
    await telephonyDialog.existForwardTitle(title);
  });

  await h(t).withLog('When I type "7" on input field ', async () => {
    await telephonyDialog.typeTextInDialer('7');
  });

  await h(t).withLog('Then I should see contact search panel', async () => {
    await t.expect(telephonyDialog.contactSearchAvatar.exists).ok();
  });

  await h(t).withLog('When I reset then input "703" via keypad', async () => {
    await telephonyDialog.clickDeleteButton();
    await telephonyDialog.tapKeypad('703');
  });

  await h(t).withLog('Then I should not see contact search panel', async () => {
    await t.expect(telephonyDialog.contactSearchAvatar.exists).notOk();
  });

  await h(t).withLog('When I click on the to forward action button', async () => {
    await telephonyDialog.clickForwardActionButton();
  });

  const alertText = 'Your call was forwarded successfully.'
  await h(t).withLog(`Then there should be fail flash toast (short = 2s) displayed "${alertText}"`, async () => {
    await t.debug();
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('And forwarder dialog should displayed', async () => {
    await forwarderWebPhone.waitForStatus('invited');
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('Then callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });
});

//Skip due to bug FIJI-7188
test.skip.meta(<ITestMeta>{
  caseIds: ['JPT-2378'],
  priority: ['P2'],
  maintainers: ['zack'],
  keywords: ['Forward']
})('Show last entered and last viewed locations when back to the custom forward page', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When webphone call this extension to me', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  const contactSearchList = app.homePage.contactSearchList;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('And I hover forward options', async () => {
    await telephonyDialog.hoverForwardButton();
  });

  await h(t).withLog('And I click custom forward button', async () => {
    await telephonyDialog.clickCustomForwardButton();
  });

  await h(t).withLog('Then check forward title exist', async () => {
    const title = "Forward Call"
    await telephonyDialog.existForwardTitle(title);
  });

  await h(t).withLog('When I type "1" on input field ', async () => {
    await telephonyDialog.typeTextInDialer('1');
    await contactSearchList.ensureLoaded();
  });

  await h(t).withLog('And I scroll to middle in contact search', async () => {
    await t.expect(contactSearchList.directDialIcon.visible).ok();
    await contactSearchList.scrollToY(50);
    await contactSearchList.expectStreamScrollToY(50);
  });

  await h(t).withLog('And I back to Incoming call page', async () => {
    await telephonyDialog.clickHideKeypadButton();
  });

  await h(t).withLog('And I go to custom forward page again', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.hoverForwardButton();
    await telephonyDialog.clickCustomForwardButton();
  });
  //BUG
  await h(t).withLog(`Then it should show last entered and last viewed locations at the custom forward page`, async () => {
    //await contactSearchList.expectStreamScrollToY(0);
    await contactSearchList.expectStreamScrollToY(50);
  });
});

//Skip due to bug FIJI-7188
test.skip.meta(<ITestMeta>{
  caseIds: ['JPT-2378','Entry2'],
  priority: ['P2'],
  maintainers: ['zack'],
  keywords: ['Forward']
})('Show last entered and last viewed locations when back to the custom forward page', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const callerWebPhone = await h(t).newWebphoneSession(caller);
  const minimizeCallWindow = app.homePage.minimizeCallWindow;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When webphone call this extension to me', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  const contactSearchList = app.homePage.contactSearchList;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('And I hover forward options', async () => {
    await telephonyDialog.hoverForwardButton();
  });

  await h(t).withLog('And I click custom forward button', async () => {
    await telephonyDialog.clickCustomForwardButton();
  });

  await h(t).withLog('Then check forward title exist', async () => {
    const title = "Forward Call"
    await telephonyDialog.existForwardTitle(title);
  });

  await h(t).withLog('When I type "1" on input field ', async () => {
    await telephonyDialog.typeTextInDialer('1');
    await contactSearchList.ensureLoaded();
  });

  await h(t).withLog('And I scroll to middle in contact search', async () => {
    await t.expect(contactSearchList.directDialIcon.visible).ok();
    await contactSearchList.scrollToY(50);
    await contactSearchList.expectStreamScrollToY(50);
  });

  await h(t).withLog('When I minimize incmoing call', async () => {
    await telephonyDialog.clickMinimizeButton();
  });

  await h(t).withLog('And I restore custom forward page again', async () => {
    await app.homePage.openDialer();
  });
  //BUG
  await h(t).withLog(`Then it should show last entered and last viewed locations at the custom forward page`, async () => {
    //await contactSearchList.expectStreamScrollToY(0);
    await contactSearchList.expectStreamScrollToY(50);
  });
});
