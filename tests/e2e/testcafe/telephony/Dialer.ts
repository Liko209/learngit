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

// TODO: change the case ids and run the test cases
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
    const homePage = app.homePage;
    const tooltipText = 'Dialer'

    await h(t).withLog('Given I have the call permission', async () => {
    });

    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await homePage.ensureLoaded();
    });

    await h(t).withLog(`Then display the dialpad button`, async () => {
      await t.expect(homePage.dialpadButton.exists).ok();
    });

    await h(t).withLog('When I hover on the to diapad button', async () => {
      await homePage.hoverDialpadButton();
    });

    await h(t).withLog(`Then display a tooltip: '${tooltipText}`, async () => {
      await homePage.showTooltip(tooltipText);
    });

    await h(t).withLog('When I click the to diapad button', async () => {
      await homePage.openDialer();
    });

    await h(t).withLog('Then display the dialer', async () => {
      await homePage.telephonyDialog.ensureLoaded();
      await t.expect(homePage.telephonyDialog.container.exists).ok();
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
    const homePage = app.homePage;

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Given dialer has been opened', async () => {
      await homePage.openDialer();
      await homePage.telephonyDialog.ensureLoaded();
    });


    await h(t).withLog('When I hover the minimize button', async () => {
      await homePage.telephonyDialog.hoverMinimizeButton();
    });

    await h(t).withLog(`Then Display a tooltip: '${tooltipText}`, async () => {
      await homePage.telephonyDialog.showTooltip(tooltipText);
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
    const ghostText = 'Type a number';
    const homePage = app.homePage;
    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await homePage.ensureLoaded();
    });

    await h(t).withLog('When dialer has been opened', async () => {
      await homePage.openDialer();
      await homePage.telephonyDialog.ensureLoaded();
    });

    await h(t).withLog(`Should display a input field with ghost text: ${ghostText}`, async ()=>{
      await t.expect(homePage.telephonyDialog.dialerInput.exists).ok();
      await t.expect(homePage.telephonyDialog.dialerInput.getAttribute('placeholder')).eql(ghostText);
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
    const homePage = app.homePage;
    const character = 'a';

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await homePage.ensureLoaded();
    });

    await h(t).withLog('Given dialer has been opened', async () => {
      await homePage.openDialer();
      await homePage.telephonyDialog.ensureLoaded();
    });

    await h(t).withLog(`When I type a character in the input field`, async () => {
      await homePage.telephonyDialog.typeTextInDialer(character);
    });

    await h(t).withLog(`Then Display the delete button`, async () => {
      await t.expect(homePage.telephonyDialog.deleteButton.exists).ok();
    });

    await h(t).withLog('When I hover the delete button', async () => {
      await homePage.telephonyDialog.hoverDeleteButton();
    });

    await h(t).withLog(`Then Display a tooltip: '${tooltipText}`, async () => {
      await homePage.telephonyDialog.showTooltip(tooltipText);
    });

    await h(t).withLog(`When I click the delete button`, async () => {
      await homePage.telephonyDialog.clickDeleteButton();
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
    const {company:{number}} = callee;
    const app = new AppRoot(t);
    const homePage = app.homePage;

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await homePage.ensureLoaded();
    });

    await h(t).withLog('When I click the to diapad button', async () => {
      await homePage.openDialer();
    });

    await h(t).withLog('Then display the dialer', async () => {
      await homePage.telephonyDialog.ensureLoaded();
      await t.expect(homePage.telephonyDialog.container.exists).ok();
    });

    await h(t).withLog(`When I type a character in the input field and click the to diapad button`, async () => {
      await homePage.telephonyDialog.typeTextInDialer(number);
    });

    await h(t).withLog('And I click the to diapad button', async () => {
      await homePage.telephonyDialog.clickDialButton();
    });

    await h(t).withLog('Then a call should be initiated', async () => {
      await t.expect(homePage.telephonyDialog.hangupButton.exists).ok();
    });

    await h(t).withLog('When I end the call', async () => {
      homePage.telephonyDialog.clickHangupButton()
    });

    await h(t).withLog(`Then I should be return to the dialer`, async () => {
      await t.expect(homePage.telephonyDialog.dialButton.exists).ok();
    });

    await h(t).withLog(`And discard all changes of dialer after initiating a call`, async () => {
      await t.expect(app.homePage.dialpadButton.value).eql('');
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
    const homePage = app.homePage;
    const settingsEntry = homePage.leftPanel.settingsEntry;
    const settingTab = app.homePage.settingTab;
    const phoneTab = settingTab.phoneSettingPage;

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await homePage.ensureLoaded();
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
      await homePage.openDialer();
    });

    let fromNumber = homePage.telephonyDialog.callerIdSelector.innerText

    await h(t).withLog(`Then should display "Blocked" in caller ID seclection of the dialer page`, async ()=>{
          await t.expect(fromNumber).eql('Blocked');
        });
  });
