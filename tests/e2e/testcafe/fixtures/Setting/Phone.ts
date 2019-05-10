import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from '../../v2/models';

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

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  await h(t).withLog(`And I click Setting entry`, async () => {
    await settingsEntry.enter();
  });
  await h(t).withLog(`And I click Phone entry`, async () => {
    await app.homePage.settingTab.phoneEntry.enter();
  });
  const phonePage = app.homePage.settingTab.phonePage;
  await h(t).withLog(`Check if Phone header display`, async () => {
    await t.expect(phonePage.header.exists).ok();
  });
  await h(t).withLog(`Check if General section display`, async () => {
    await t.expect(phonePage.generalSection.exists).ok()
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
