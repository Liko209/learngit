/*
 * @Author: Potar.He
 * @Date: 2019-04-08 14:34:14
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { h } from '../../../v2/helpers';
import { setupCase, teardownCase } from '../../../init';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../../config';
import { ITestMeta } from '../../../v2/models';

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2133'],
  maintainers: ['Potar.He'],
  keywords: ['voicemail']
})('Check can open the Voicemail sub tab', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];

  const voicemailTitle = 'Voicemail';

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click Phone entry of leftPanel,', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
  });
  const voicemailEntry = app.homePage.phoneTab.voicemailEntry;
  await h(t).withLog('Then I will see voicemail entry', async () => {
    await voicemailEntry.ensureLoaded();
  });

  await h(t).withLog('When I click voicemail entry', async () => {
    await voicemailEntry.enter();
  });

  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  await h(t).withLog('Then voicemail page should be open', async () => {
    await voicemailEntry.shouldBeOpened();
    await voicemailPage.ensureLoaded();
  });

  await h(t).withLog('And page title should be {title}', async (step) => {
    step.setMetadata('title', voicemailTitle);
    await t.expect(voicemailPage.headerTitle.textContent).eql(voicemailTitle);
  });
});
