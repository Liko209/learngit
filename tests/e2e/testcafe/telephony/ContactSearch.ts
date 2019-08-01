/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-05 14:57:15
 * Copyright © RingCentral. All rights reserved.
 */

import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta } from '../v2/models';
import { MiscUtils } from '../v2/utils'
import { E911Address } from './e911address';

fixture('Telephony/Dialer')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-2182'],
  priority: ['P0'],
  maintainers: ['Lex.Huang'],
  keywords: ['ContactSearch']
})('Can make outbound call when click the contact of search results', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const callee = h(t).rcData.mainCompany.users[1];
  const { extension } = callee;
  const app = new AppRoot(t);

  const searchStr = extension.replace('+', '');

  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).glip(loginUser).resetProfileAndState();

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click the to dialPad button', async () => {
    await app.homePage.openDialer();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog(`And I enter "{searchStr}" into input field via keyboard`, async (step) => {
    step.setMetadata('searchStr', searchStr);
    await telephonyDialog.typeTextInDialer(searchStr);
  });

  await h(t).withLog(`Then should display the search results`, async () => {
    await telephonyDialog.contactSearchList.ensureLoaded();
  });

  await h(t).withLog('Click the the first item via mouse', async () => {
    await telephonyDialog.contactSearchList.selectNth(0);
    // the first select conn't trigger click, so the trick is click it again.
    await telephonyDialog.contactSearchList.selectNth(0);
  });

  await h(t).withLog('Then a call should be initiated', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
    await t.expect(telephonyDialog.extension.withText(extension).exists).ok();
  });

  await h(t).withLog('When I end the call', async () => {
    await telephonyDialog.clickHangupButton()
  });

  await h(t).withLog(`And I enter "{searchStr}" into input field via keyboard again`, async (step) => {
    step.setMetadata('searchStr', searchStr);
    await telephonyDialog.typeTextInDialer(searchStr);
  });

  await h(t).withLog('Click the the 2nd item via mouse', async () => {
    await telephonyDialog.contactSearchList.ensureLoaded();
    await telephonyDialog.contactSearchList.selectNth(1)
  });

  await h(t).withLog('Then a call should be initiated', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
    await t.expect(telephonyDialog.extension.withText(extension).exists).ok();
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2252'],
  priority: ['P2'],
  maintainers: ['Lex.Huang'],
  keywords: ['ContactSearch']
})('Can exit the search mode after cleared all content from input field', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  const searchStr = '1';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click the to diapad button', async () => {
    await app.homePage.openDialer();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog(`And I enter "${searchStr}" into input field via keyboard`, async () => {
    await telephonyDialog.typeTextInDialer(searchStr);
  });

  await h(t).withLog('Then can show the delete button and the search result', async () => {
    await telephonyDialog.contactSearchList.ensureLoaded();
    await t.expect(telephonyDialog.deleteButton.exists).ok();
  });

  await h(t).withLog(`When I click the delete button`, async () => {
    await telephonyDialog.clickDeleteButton();
  });

  await h(t).withLog(`Then the input should be cleared and display the dialer`, async () => {
    await t.expect(telephonyDialog.dialerInput.value).eql('');
    await t.expect(telephonyDialog.dialButton.exists).ok();
  });
});
