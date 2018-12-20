/*
 * @Author: Mia Cai (mia.cai@ringcentral.com)
 */

import { formalName } from '../libs/filter';
import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { SITE_URL, ACCOUNT_TYPE_LIST } from '../config';

Object.keys(ACCOUNT_TYPE_LIST).map((accountType) => ACCOUNT_TYPE_LIST[accountType]).forEach(accountType => {
  fixture('Logout')
    .beforeEach(setupCase(accountType))
    .afterEach(teardownCase());

  test(formalName('Logout', ['JPT-70', 'P0', 'Logout']), async (t) => {
    const user = h(t).rcData.mainCompany.users[4];
    const app = new AppRoot(t);

    await h(t).withLog(`Given I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
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
});