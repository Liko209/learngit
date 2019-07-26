/*
 * @Author: Skye Wang (skye.wang@ringcentral.com)
 * @Date: 2019-07-26 10:14:54
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('Telephony/ToVoiceMail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-2537'],
  priority: ['P2'],
  maintainers: ['skye.wang'],
  keywords: ['Presence']
})('Can manually set presence', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).scenarioHelper.resetProfile(loginUser);
  const app = new AppRoot(t);
  const toolTipAvailable = 'Available';
  const toolTipInvisible = 'Offline';
  const toolTipDoNotDisturb = 'Do not disturb';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const avatar = app.homePage.avatar;
  const settingMenu = app.homePage.settingMenu;
  
  await h(t).withLog('When I change the presence to "available" ' , async () => {
    await app.homePage.openSettingMenu();
    await settingMenu.hoverPresenceMenuButton();
    await settingMenu.clickPresenceSubMenuAvailableButton();

  });

  await h(t).withLog('Then check the presence change to "available" ' , async () => {
    await avatar.hoverTopBarAvatar();
    await avatar.showTooltip(toolTipAvailable);

  });

});;