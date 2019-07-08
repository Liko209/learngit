/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-04 18:53:51
 * Copyright © RingCentral. All rights reserved.
 */
import * as _ from 'lodash';
import { h } from '../../../v2/helpers';
import { setupCase, teardownCase } from '../../../init';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../../config';
import { ITestMeta } from '../../../v2/models';
import { ensuredOneVoicemail } from './utils';

fixture('PhoneTab/VoiceMail/Filter')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2433'],
  maintainers: ['chris.zhan'],
  keywords: ['voicemail']
})('Check the ghost of Voicemail filter', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const user = users[4];

  const phoneFilterPlaceholder = 'Filter voicemail';

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: user.company.number,
      extension: user.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, user);
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

  await h(t).withLog('And filter ghost should has placeholder text "{placeholder}"', async (step) => {
    step.setMetadata('placeholder', phoneFilterPlaceholder);
    await t.expect(voicemailPage.filterInput.getAttribute('placeholder')).eql(phoneFilterPlaceholder);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2436', 'JPT-2435'],
  maintainers: ['chris.zhan'],
  keywords: ['voicemail']
})('Check the character limit of Voicemail filter & Check the display should show an empty view with message of No matched records', async (t) => {

  const filterKey = 'Non nulla eu Lorem laborum ea proident cillum aliquip pariatur deserunt laborum exercitation et. Nostrud dolor do exercitation eiusmod consectetur duis ullamco consectetur voluptate fugiat tempor dolore. Commodo do mollit sit proident quis. Velit Lorem fugiat laboris id adipisicing cillum eu velit aliquip proident ullamco excepteur incididunt. Exercitation nisi in commodo elit do amet laborum culpa nulla ullamco ipsum Lorem enim.';
  const users = h(t).rcData.mainCompany.users;
  const callee = users[4];
  const caller = users[5];

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

  await h(t).withLog(`When the other user send me a voicemail`, async () => {
    await ensuredOneVoicemail(t, caller, callee, app);
  });

  await h(t).withLog('Then we can see more than one voicemail', async () => {
    const count = await voicemailPage.items.count;
    await t.expect(count).gte(1);
  });

  await h(t).withLog('When I type random long text in the input', async () => {
    await t.typeText(voicemailPage.filterInput, filterKey, {replace: true});
  });

  await h(t).withLog('Then the value should only be 60 characters', async (step) => {
    await t.expect(voicemailPage.filterInput.value).eql(filterKey.substr(0, 60));
  });

  await h(t).withLog('And we can see the empty page', async () => {
    await t.expect(voicemailPage.emptyPage.exists).ok();
  });

  await h(t).withLog('And with text "No matches found"', async () => {
    await t.expect(voicemailPage.emptyPage.textContent).contains('No matches found');
  });
});
