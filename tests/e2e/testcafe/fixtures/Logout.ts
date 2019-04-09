/*
 * @Author: Mia Cai (mia.cai@ringcentral.com)
 */

import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta } from "../v2/models";

for (const accountType of [BrandTire.RCOFFICE, BrandTire.RC_PROFESSIONAL_TIER, BrandTire.RC_FIJI_GUEST]) {
  fixture('Logout')
    .beforeEach(setupCase(accountType))
    .afterEach(teardownCase());

  test.meta(<ITestMeta>{
    priority: ['P0'],
    caseIds: ['JPT-70'],
    maintainers: ['Potar.He'],
    keywords: ['Logout'],
  })('Logout', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[1];
    const app = new AppRoot(t);

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });
    await h(t).withLog('Then I can open setting menu in home page', async () => {
      await app.homePage.openSettingMenu();
      await app.homePage.settingMenu.ensureLoaded();
    });
    await h(t).withLog('When I click logout button in setting menu', async () => {
      await app.homePage.settingMenu.clickLogout();
    });
    await h(t).withLog('Then I should logout from Jupiter and back to login page', async () => {
      await t.expect(h(t).href).contains('unified-login');
    }, true);
  });
};