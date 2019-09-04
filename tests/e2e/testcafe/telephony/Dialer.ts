/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-09 21:26:40
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta, IGroup } from '../v2/models';
import { WebphoneSession } from 'webphone-client';
import { E911Address } from './e911address';

fixture('Telephony/Dialer')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-1810'],
  priority: ['P2'],
  maintainers: ['Lex.Huang'],
  keywords: ['Dialer']
})('Can show the tooltip when hovering on the [Dialpad] button', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
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

test.skip.meta(<ITestMeta>{
  caseIds: ['JPT-1905'],
  priority: ['P2'],
  maintainers: ['Lex.Huang'],
  keywords: ['Dialer']
})('Can show the tooltip when hovering on the to minimize button of the dialer', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
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
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  const app = new AppRoot(t);
  const ghostText = 'Enter a name or number';
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
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
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

  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).platform(callee).init();
  await h(t).platform(callee).updateDevices(() => E911Address);

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

  await h(t).withLog('And I hit the `Enter` key', async () => {
    await app.homePage.confirmE911Form();
    await app.homePage.telephonyDialog.hitEnterToMakeCall();
  });

  await h(t).withLog('Then a call should be initiated', async () => {
    await t.expect(app.homePage.telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I end the call', async () => {
    await app.homePage.telephonyDialog.clickHangupButton();
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

  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
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

  await h(t).withLog('And I hit the `Enter` key', async () => {
    await app.homePage.telephonyDialog.hitEnterToMakeCall();
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
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).platform(callee).init();
  const phoneNumbers = await h(t).platform(callee).getExtensionPhoneNumberList();
  const calleeDirectNumbers = phoneNumbers.data.records.filter(data => data.usageType == "DirectNumber").map(data => data.phoneNumber)
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
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

  await h(t).withLog(`When I type a character "{phoneNumber}" in the input field`, async (step) => {
    step.setMetadata('phoneNumber', calleeDirectNumbers[0])
    await telephonyDialog.typeTextInDialer(calleeDirectNumbers[0]);
  });

  await h(t).withLog('And I hit the `Enter` key', async () => {
    await app.homePage.telephonyDialog.hitEnterToMakeCall();
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

  await h(t).withLog('Then the Dialpad should populated last phone number {phoneNumber}', async (step) => {
    step.setMetadata('phoneNumber', calleeDirectNumbers[0])
    await t.expect(app.homePage.telephonyDialog.dialerInput.value).eql(calleeDirectNumbers[0]);
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-1964', 'JPT-1901'],
  priority: ['P1'],
  maintainers: ['Foden.Lin'],
  keywords: ['Dialer']
})('Can display the default caller ID in "Caller ID" selection', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
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
    await phoneTab.selectCallerIdByText('Blocked');
  });
  await h(t).withLog('And I click the to diapad button', async () => {
    await app.homePage.openDialer();
  });

  await h(t).withLog(`Then should display "Blocked" in caller ID seclection of the dialer page`, async () => {
    await t.expect(app.homePage.telephonyDialog.callerIdSelector.textContent).eql('Blocked');
  });

  await h(t).withLog(`And I click the caller id`, async () => {
    await phoneTab.clickCallerIDDropDown();
  });

  let callerIdNumber = await phoneTab.callerIDDropDownItems.nth(0).innerText
  await h(t).withLog(`And I set the caller id is ${callerIdNumber} from the setting`, async () => {
    await phoneTab.selectCallerIdByText(callerIdNumber);
  });

  await h(t).withLog(`Then should display ${callerIdNumber} in caller ID seclection of the dialer page`, async () => {
    const txt = await app.homePage.telephonyDialog.callerIdSelector.textContent;
    await t.expect(callerIdNumber).contains(txt);
  });
});


test.meta(<ITestMeta>{
  caseIds: ['JPT-2353'],
  priority: ['P2'],
  maintainers: ['Lex.Huang'],
  keywords: ['Dialer']
})('Show the cursor in the input field when focus on the dialer page again', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0]
  const anotherUser = users[1];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  const telephonyDialog = app.homePage.telephonyDialog;

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a 1:1 chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // conversation page header
  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('When I open the 1:1 chat', async () => {
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog('And dialer has been opened', async () => {
    await app.homePage.openDialer();
    await app.homePage.telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`And enter some contents into the input field`, async () => {
    await app.homePage.telephonyDialog.typeTextInDialer('1');
  });

  await h(t).withLog('And I click the [caller id] from dialer page', async () => {
    await telephonyDialog.clickCallerIdSelector();
    await telephonyDialog.callerIdList.selectBlocked();
  });

  await h(t).withLog('Then should focus on the dialer page, show the cursor in the input field', async () => {
    await t.expect(telephonyDialog.dialerInput.focused).ok();
  });

  await h(t).withLog(`When I click the delete button`, async () => {
    await app.homePage.telephonyDialog.clickDeleteButton();
  });

  await h(t).withLog('Then should focus on the dialer page, show the cursor in the input field', async () => {
    await t.expect(telephonyDialog.dialerInput.focused).ok();
  });

  await h(t).withLog('Given I focus on the conversation input', async () => {
    await t.click(conversationPage.messageInputArea);
  });

  await h(t).withLog('Then should blur on the dialer page', async () => {
    await t.expect(telephonyDialog.dialerInput.focused).notOk();
  });

  await h(t).withLog('When I type the keypad from dialer page', async () => {
    await telephonyDialog.tapKeypad(['1']);
  });

  await h(t).withLog('Then should focus on the dialer page, show the cursor in the input field', async () => {
    await t.expect(telephonyDialog.dialerInput.focused).ok();
  });

  await h(t).withLog('And I focus on the conversation input', async () => {
    await t.click(conversationPage.messageInputArea);
  });

  await h(t).withLog('Then should blur on the dialer page', async () => {
    await t.expect(telephonyDialog.dialerInput.focused).notOk();
  });

  await h(t).withLog(`Given I click the delete button`, async () => {
    await app.homePage.telephonyDialog.clickDeleteButton();
  });

  await h(t).withLog('Then should focus on the dialer page, show the cursor in the input field', async () => {
    await t.expect(telephonyDialog.dialerInput.focused).ok();
  });

  await h(t).withLog('Given I focus on the conversation input', async () => {
    await t.click(conversationPage.messageInputArea);
  });

  await h(t).withLog('And I select call from "Blocked" ', async () => {
    await telephonyDialog.clickCallerIdSelector();
    await telephonyDialog.callerIdList.selectBlocked();
  });

  await h(t).withLog('Then should focus on the dialer page, show the cursor in the input field', async () => {
    await t.expect(telephonyDialog.dialerInput.focused).ok();
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2487'],
  priority: ['P2'],
  maintainers: ['Naya.Fang'],
  keywords: ['Dialer']
})('Can enter the search contact mode after edited the content of the custom forward ', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const phoneTab = settingTab.phoneSettingPage;
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog('When I receive an inbound call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });
  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });
  await h(t).withLog('And I click the call actions button', async () => {
    await telephonyDialog.clickMoreOptionsButton();
  });
  await h(t).withLog('And I hover forward options', async () => {
    await telephonyDialog.hoverForwardButton();
  });
  await h(t).withLog('And I click custom forward button', async () => {
    await telephonyDialog.clickCustomForwardButton();
  });
  await h(t).withLog('And I click "11" on the keypad', async () => {
    await telephonyDialog.tapKeypad('11');
  });
  await h(t).withLog('And callerUser hangup the call', async () => {
    await callerWebPhone.hangup();
  });
  await t.wait(2000)
  await h(t).withLog('And I click the Dialpad button', async () => {
    await app.homePage.openDialer();
  });
  await h(t).withLog('Then display the dialer', async () => {
    await telephonyDialog.ensureLoaded();
  });
  const { extension } = caller;
  const searchStr = extension.replace('+', '');
  await h(t).withLog(`When I enter "${searchStr}" into input field via keyboard`, async () => {
    await app.homePage.telephonyDialog.typeTextInDialer(searchStr);
  });
  await t.wait(2000)
  await h(t).withLog(`Then should display the search results`, async () => {
    await t.expect(app.homePage.telephonyDialog.contactSearchList.exists).ok();
  });
});


test.meta(<ITestMeta>{
  caseIds: ['JPT-1908', 'JPT-1918'],
  priority: ['P2'],
  maintainers: ['Foden.Lin'],
  keywords: ['Dialer']
})('Can save the change of dialer before initiating a call and can be reset after fresh', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open dialer', async () => {
    await app.homePage.openDialer();
  });

  await h(t).withLog(`And enter some contents into the input field`, async () => {
    await telephonyDialog.typeTextInDialer('1');
  });

  await h(t).withLog('And I set the caller ID as "Blocked"', async () => {
    await telephonyDialog.clickCallerIdSelector();
    await telephonyDialog.callerIdList.selectBlocked();
  });

  await h(t).withLog(`Then should display "Blocked" in caller ID selection`, async () => {
    await t.expect(telephonyDialog.callerIdSelector.textContent).eql('Blocked');
  });

  await h(t).withLog(`Then should display "1" in dialer input box`, async () => {
    await t.expect(telephonyDialog.dialerInput.value).eql('1');
  });

  await h(t).withLog(`When I refresh App`, async () => {
    await h(t).reload();
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open dialer', async () => {
    await app.homePage.openDialer();
  });

  await h(t).withLog(`Then shouldn't display "Blocked" in caller ID selection`, async () => {
    await t.expect(telephonyDialog.callerIdSelector.textContent).notEql('Blocked');
  });

  await h(t).withLog(`Then shouldn't display "1" in in dialer input box`, async () => {
    await t.expect(telephonyDialog.dialerInput.value).notEql('1');
  });
});
