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

fixture('Telephony/Forward')
.beforeEach(setupCase(BrandTire.RC_WITH_PHONE))
.afterEach(teardownCase());

// currently SDET do not support forward list account so this case will be pending

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

  await h(t).withLog('Then I click more options button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });

  await h(t).withLog('Then I hover forward options', async () => {
    await telephonyDialog.hoverForwardButton();
  });

  await h(t).withLog('Then I click custom forward button', async () => {
    await telephonyDialog.clickCustomForwardButton();
  });

  await h(t).withLog('When I click "703" on the keypad ', async () => {
    await telephonyDialog.tapKeypad('703');
  });

  await h(t).withLog('When I click on the to forward action button', async () => {
    await telephonyDialog.clickForwardActionButton();
  });

    await h(t).withLog('Then forwarder dialog should displayed', async () => {
    await forwarderWebPhone.waitForStatus('invited');
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });

  await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
    await callerWebPhone.waitForStatus('terminated');
  });
});
