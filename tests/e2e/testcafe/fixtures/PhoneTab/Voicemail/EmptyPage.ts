/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-06-25 14:07:01
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { h } from '../../../v2/helpers';
import { setupCase, teardownCase } from '../../../init';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../../config';
import { ITestMeta } from '../../../v2/models';
import { ensuredOneVoicemail } from './utils';

fixture('PhoneTab/VoiceMail/EmptyPage')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P3'],
  caseIds: ['JPT-2137'],
  maintainers: ['chris.zhan'],
  keywords: ['voicemail']
})('Check the voicemail empty page', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const callee = users[4];
  const caller = users[5];

  const voicemailTitle = 'Voicemail';


  await h(t).withLog('Given I clear voicemails of extension: {number}#{extension}', async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    });
    await h(t).platform(callee).init();
    await h(t).platform(callee).deleteAllVoicemail();
  });

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, callee);
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

  await h(t).withLog('And we can see the empty page', async () => {
    await t.expect(voicemailPage.emptyPage.exists).ok();
  });

  await h(t).withLog('And with text "No voicemail records"', async () => {
    await t.expect(voicemailPage.emptyPage.textContent).contains('No voicemail records')
  });

  await h(t).withLog(`When the other user send me a voicemail`, async () => {
    await ensuredOneVoicemail(t, caller, callee, app);
  });

  await h(t).withLog('Then we can not see the empty page', async () => {
    await t.expect(voicemailPage.emptyPage.exists).notOk();
  });
});
