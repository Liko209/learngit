/*
 * @Author: Foden Lin(foden.lin@ringcentral.com)
 * @Date: 2019-07-26 08:50:18
 * Copyright © RingCentral. All rights reserved.
 */

import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire, SITE_ENV } from '../../config';
import {ITestMeta} from "../../v2/models";

fixture('PresenceSetting/DoNotDisturb')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2563'],
  maintainers: ['Foden.lin'],
  keywords: ['DoNotDisturb']
})('Check banner of "Do not disturb"', async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  const settingMenu = app.homePage.settingMenu
  const dndPresenceTooltip = "Do not disturb"
  const availablePresenceTooltip = "Available"


  await h(t).withLog('Given I login to Unified login page with RC account correct password and correct extension', async () => {
    await h(t).jupiterHelper.selectEnvironment(SITE_URL, SITE_ENV);
    await app.loginPage.interactiveSignIn(loginUser.company.number, loginUser.extension, loginUser.password);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I set presence is "Do not disturb"', async () => {
    await app.homePage.openSettingMenu();
    await settingMenu.hoverPresenceMenuButton();
    await settingMenu.clickPresenceSubMenuDndButton();
  });

  await h(t).withLog(`Then Dnd top banner and unblock are displayed`, async () => {
    await t.expect(settingMenu.dndTopBanner.exists).ok();
    await t.expect(settingMenu.dndUnblockButton.exists).ok();
  });

  await h(t).withLog('And the presence is do not disturb', async () => {
    await app.homePage.hoverSettingMenu();
    await settingMenu.showTooltip(dndPresenceTooltip);
  });

  await h(t).withLog('When I unblock DND', async () => {
    await settingMenu.clickDndUnblockButton();
  });

  await h(t).withLog(`Then Dnd top banner and unblock are disappeared`, async () => {
    await t.expect(settingMenu.dndTopBanner.exists).notOk();
    await t.expect(settingMenu.dndUnblockButton.exists).notOk();
  });

  await h(t).withLog('And the presence is available', async () => {
    await app.homePage.hoverSettingMenu();
    await settingMenu.showTooltip(availablePresenceTooltip);
  });
});
