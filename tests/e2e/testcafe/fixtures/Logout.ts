/*
 * @Author: Mia Cai (mia.cai@ringcentral.com)
 */

import { formalName } from '../libs/filter';
import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { SITE_URL } from '../config';

fixture('Logout')
    .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
    .afterEach(teardownCase());

test(formalName('Logout', ['JPT-', 'P0', 'Logout']), async (t) => {
    const user = h(t).rcData.mainCompany.users[4];
    const app = new AppRoot(t);

    await h(t).withLog(`Given I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
    });
    await h(t).withLog('When I Click top bar avatar', async () => {
        await app.homePage.openSettingMenu();
    })
    await h(t).withLog('Then show menu should appear', async () => {
        await app.homePage.settingMenu.ensureLoaded();
    })
    await h(t).withLog('When Click logout button', async () => {
        await app.homePage.settingMenu.clickLogout();

    })
    await h(t).withLog('Then logout successfully (url contains unified-login)', async () => {
        await t.expect(h(t).href).contains('unified-login');
    }, true)
});