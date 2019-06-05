/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-09 21:26:40
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta } from '../v2/models';
import { WebphoneSession } from 'webphone-client';

fixture('Telephony/Dialer')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-1810'],
  priority: ['P2'],
  maintainers: ['Lex.Huang'],
  keywords: ['Dialer']
})('Can show the tooltip when hovering on the [Dialpad] button', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  const tooltipText = 'Dialer'

  await h(t).withLog('Given I have the call permission', async () => {
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`Then display the dialpad button`, async () => {
    await t.expect(app.homePage.dialpadButton.exists).ok();
  });

  await h(t).withLog('When I hover on the to diapad button', async () => {
    await app.homePage.hoverDialpadButton();
  });

  await h(t).withLog(`Then display a tooltip: '${tooltipText}`, async () => {
    await app.homePage.showTooltip(tooltipText);
  });

  await h(t).withLog('When I click the to diapad button', async () => {
    await app.homePage.openDialer();
  });

  await h(t).withLog('Then display the dialer', async () => {
    await app.homePage.telephonyDialog.ensureLoaded();
    await t.expect(app.homePage.telephonyDialog.self.exists).ok();
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-1905'],
  priority: ['P2'],
  maintainers: ['Lex.Huang'],
  keywords: ['Dialer']
})('Can show the tooltip when hovering on the to minimize button of the dialer', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  const tooltipText = 'Minimize';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Given dialer has been opened', async () => {
    await app.homePage.openDialer();
    await app.homePage.telephonyDialog.ensureLoaded();
  });


  await h(t).withLog('When I hover the minimize button', async () => {
    await app.homePage.telephonyDialog.hoverMinimizeButton();
  });

  await h(t).withLog(`Then Display a tooltip: '${tooltipText}`, async () => {
    await app.homePage.telephonyDialog.showTooltip(tooltipText);
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-1921'],
  priority: ['P2'],
  maintainers: ['Lex.Huang'],
  keywords: ['Dialer']
})('Can show the ghost text when dialer is empty', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  const ghostText = 'Enter a number';
  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When dialer has been opened', async () => {
    await app.homePage.openDialer();
    await app.homePage.telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Should display a input field with ghost text: ${ghostText}`, async () => {
    await t.expect(app.homePage.telephonyDialog.dialerInput.exists).ok();
    await t.expect(app.homePage.telephonyDialog.dialerInput.getAttribute('placeholder')).eql(ghostText);
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-1888', 'JPT-1891', 'JPT-1894', 'JPT-1886'],
  priority: ['P1', 'P2'],
  maintainers: ['Lex.Huang'],
  keywords: ['Dialer']
})('Can show the delete button when click the keypad on the dialer', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  const tooltipText = 'Delete';
  const character = 'a';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Given dialer has been opened', async () => {
    await app.homePage.openDialer();
    await app.homePage.telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`When I type a character in the input field`, async () => {
    await app.homePage.telephonyDialog.typeTextInDialer(character);
  });

  await h(t).withLog(`Then Display the delete button`, async () => {
    await t.expect(app.homePage.telephonyDialog.deleteButton.exists).ok();
  });

  await h(t).withLog('When I hover the delete button', async () => {
    await app.homePage.telephonyDialog.hoverDeleteButton();
  });

  await h(t).withLog(`Then Display a tooltip: '${tooltipText}`, async () => {
    await app.homePage.telephonyDialog.showTooltip(tooltipText);
  });

  await h(t).withLog(`When I click the delete button`, async () => {
    await app.homePage.telephonyDialog.clickDeleteButton();
  });

  await h(t).withLog(`Then the input should be cleared`, async () => {
    await t.expect(app.homePage.dialpadButton.value).eql('');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-1902', 'JPT-1909'],
  priority: ['P0', 'P2'],
  maintainers: ['Lex.Huang'],
  keywords: ['Dialer']
})('Can initiate a call via dialer', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const callee = h(t).rcData.mainCompany.users[1];
  const { company: { number } } = callee;
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click the to diapad button', async () => {
    await app.homePage.openDialer();
  });

  await h(t).withLog('Then display the dialer', async () => {
    await app.homePage.telephonyDialog.ensureLoaded();
    await t.expect(app.homePage.telephonyDialog.self.exists).ok();
  });

  await h(t).withLog(`When I type a character in the input field`, async () => {
    await app.homePage.telephonyDialog.typeTextInDialer(number);
  });

  await h(t).withLog('And I click the to diapad button', async () => {
    await app.homePage.telephonyDialog.clickDialButton();
  });

  await h(t).withLog('Then a call should be initiated', async () => {
    await t.expect(app.homePage.telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I end the call', async () => {
    app.homePage.telephonyDialog.clickHangupButton()
  });

  await h(t).withLog(`Then I should be return to the dialer`, async () => {
    await t.expect(app.homePage.telephonyDialog.dialButton.exists).ok();
  });

  await h(t).withLog(`And discard all changes of dialer after initiating a call`, async () => {
    await t.expect(app.homePage.dialpadButton.value).eql('');
  });
});

fixture('Telephony/Dialer')
  .beforeEach(setupCase(BrandTire.RC_WITH_GUESS_DID))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-1911'],
  priority: ['P1'],
  maintainers: ['Potar.He'],
  keywords: ['Dialer']
})('Can initiate a call when caller ID is blocked via the dialer', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const callee = h(t).rcData.guestCompany.users[0];
  await h(t).platform(callee).init();
  const phoneNumbers = await h(t).platform(callee).getExtensionPhoneNumberList();
  const calleeDirectNumbers = phoneNumbers.data.records.filter(data => data.usageType == "DirectNumber").map(data => data.phoneNumber)
  const app = new AppRoot(t);

  let webphoneSession: WebphoneSession;
  await h(t).withLog(`Given webphone seesion login with ${callee.company.number}#${callee.extension}`, async () => {
    webphoneSession = await h(t).webphoneHelper.newWebphoneSession(callee);
  });
  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click the to diapad button', async () => {
    await app.homePage.openDialer();
  });

  const telephonyDialog = app.homePage.telephonyDialog;

  await h(t).withLog('Then display the dialer', async () => {
    await telephonyDialog.ensureLoaded();
    await t.expect(telephonyDialog.self.exists).ok();
  });

  await h(t).withLog(`When I type a character in the input field`, async () => {
    await telephonyDialog.typeTextInDialer(calleeDirectNumbers[0]);
  });

  await h(t).withLog('And I select call from "Blocked" ', async () => {
    await telephonyDialog.clickCallerIdSelector();
    await telephonyDialog.callerIdList.selectBlocked();
  });

  await h(t).withLog('And I click the to diapad button', async () => {
    await telephonyDialog.clickDialButton();
  });


  await h(t).withLog('Then a call should be initiated', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('And the callee can receive the call from Unknown caller ', async () => {
    await webphoneSession.waitForPhoneNumber('anonymous'); // Unknown call number in webphonesession is "anonymous"
  });
});


test.meta(<ITestMeta>{
  caseIds: ['JPT-1917'],
  priority: ['P1'],
  maintainers: ['Zack.Zheng'],
  keywords: ['Dialer']
})('Can save the last call number', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const callee = h(t).rcData.guestCompany.users[0];
  await h(t).platform(callee).init();
  const phoneNumbers = await h(t).platform(callee).getExtensionPhoneNumberList();
  const calleeDirectNumbers = phoneNumbers.data.records.filter(data => data.usageType == "DirectNumber").map(data => data.phoneNumber)
  const app = new AppRoot(t);

  let webphoneSession: WebphoneSession;
  await h(t).withLog(`Given webphone seesion login with ${callee.company.number}#${callee.extension}`, async () => {
    webphoneSession = await h(t).webphoneHelper.newWebphoneSession(callee);
  });
  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click the to Dialpad button', async () => {
    await app.homePage.openDialer();
  });

  const telephonyDialog = app.homePage.telephonyDialog;

  await h(t).withLog('Then display the dialer', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`When I type a character in the input field`, async () => {
    await telephonyDialog.typeTextInDialer(calleeDirectNumbers[0]);
  });

  await h(t).withLog('And I click the to Dialpad button', async () => {
    await telephonyDialog.clickDialButton();
  });

  await h(t).withLog('Then a call should be initiated', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I end the call and back to Dialpad', async () => {
    //Add wait 2 seconds otherwise it wouldn't trigger clickHangupButton event.
    await t.wait(2e3);
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('And I click the Dialpad call button', async () => {
    await telephonyDialog.clickDialButton();
  });

  await h(t).withLog('Then the Dialpad should populated last phone number', async () => {
    await t.expect(app.homePage.telephonyDialog.dialerInput.value).eql(calleeDirectNumbers[0]);
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-1964'],
  priority: ['P1'],
  maintainers: ['Foden.Lin'],
  keywords: ['Dialer']
})('Can display the default caller ID in "Caller ID" selection', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const phoneTab = settingTab.phoneSettingPage;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`And I click the caller id`, async () => {
    await phoneTab.clickCallerIDDropDown();
  });

  await h(t).withLog(`And I set the caller id is "Blocked" from the setting`, async () => {
    await phoneTab.selectCallerID('Blocked');
  });
  await h(t).withLog('And I click the to diapad button', async () => {
    await app.homePage.openDialer();
  });

  await h(t).withLog(`Then should display "Blocked" in caller ID seclection of the dialer page`, async () => {
    await t.expect(app.homePage.telephonyDialog.callerIdSelector.textContent).eql('Blocked');
  });
});
