import * as _ from 'lodash';
import { h } from '../../../v2/helpers';
import { setupCase, teardownCase } from '../../../init';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../../config';
import { ITestMeta } from "../../../v2/models";


fixture('Setting/Phone')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1735'],
  maintainers: ['William.Ye'],
  keywords: ['Phone']
})('Check the "Phone" settings when the user has call permission', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension} which has extension has call permission:`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`Then sub-setting Phone entry exist`, async () => {
    await app.homePage.settingTab.phoneEntry.ensureLoaded();
  });

  await h(t).withLog(`When I click Phone entry`, async () => {
    await app.homePage.settingTab.phoneEntry.enter();
  });

  const phoneSettingPage = app.homePage.settingTab.phoneSettingPage;
  await h(t).withLog(`Then the setting page header text should be 'Phone'`, async () => {
    await t.expect(phoneSettingPage.headerTitle.withExactText('Phone').exists).ok();
  });

  await h(t).withLog(`And General section should display`, async () => {
    await t.expect(phoneSettingPage.generalSection.exists).ok()
  });
})


fixture('Setting/Phone')
  .beforeEach(setupCase(BrandTire.RC_VOIP_DISABLE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1736'],
  maintainers: ['William.Ye'],
  keywords: ['Phone']
})('Check the "Phone" settings when the user has not call permission', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  await h(t).withLog(`And I click Setting entry`, async () => {
    await settingsEntry.enter();
  });
  await h(t).withLog(`The Phone entry is hidden`, async () => {
    await t.expect(app.homePage.settingTab.phoneEntry.exists).notOk();
  });

})