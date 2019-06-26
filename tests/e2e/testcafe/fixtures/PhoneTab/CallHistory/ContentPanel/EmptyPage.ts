/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-06-26 10:09:34
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { setupCase, teardownCase } from '../../../../init';
import { BrandTire, SITE_URL } from '../../../../config';
import { ITestMeta } from '../../../../v2/models';
import { h } from '../../../../v2/helpers';
import { AppRoot } from '../../../../v2/page-models/AppRoot';
import { ensuredOneCallLog } from '../utils';

fixture('PhoneTab/CallHistory/EmptyPage')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2138'],
  maintainers: ['chris.zhan'],
  keywords: ['callHistory']
})('Check the call log empty page', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const callee = users[4];
  const caller = users[5];

  const callHistoryTitle = 'Call history';

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click Phone entry of leftPanel,', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
  });
  const callHistoryEntry = app.homePage.phoneTab.callHistoryEntry;
  await h(t).withLog('Then I will see call history entry', async () => {
    await callHistoryEntry.ensureLoaded();
  });

  await h(t).withLog('When I click call history entry', async () => {
    await callHistoryEntry.enter();
  });

  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
  await h(t).withLog('Then callHistory page should be open', async () => {
    await callHistoryEntry.shouldBeOpened();
    await callHistoryPage.ensureLoaded();
  });

  await h(t).withLog('And page title should be {title}', async (step) => {
    step.setMetadata('title', callHistoryTitle);
    await t.expect(callHistoryPage.headerTitle.textContent).eql(callHistoryTitle);
  });

  await h(t).withLog('And we can see the empty page', async () => {
    await t.expect(callHistoryPage.emptyPage.exists).ok();
  });

  await h(t).withLog('And with text "No call log"', async () => {
    await t.expect(callHistoryPage.emptyPage.textContent).contains('No call log')
  });

  await h(t).withLog(`When the other user call me`, async () => {
    await ensuredOneCallLog(t, caller, callee, app);
  });

  await h(t).withLog('Then we can not see the empty page', async () => {
    await t.expect(callHistoryPage.emptyPage.exists).notOk();
  });
});
