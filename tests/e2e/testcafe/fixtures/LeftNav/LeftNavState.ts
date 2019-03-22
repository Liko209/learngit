/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-11 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';

fixture('LeftNav')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

  test(
    formalName('Check the each user can remember the status of left navigation', ['P2', 'JPT-18']), async (t) => {
      const minLeftPanelWidth = 72;
      const maxLeftPanelWidth = 200;
  
      const app = new AppRoot(t);
      const loginUser = h(t).rcData.mainCompany.users[0];
      const otherUser = h(t).rcData.mainCompany.users[1];
  
      await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      }, true);
  
      const leftPanel = app.homePage.leftPanel;
  
      await h(t).withLog(`Then width of left panel should be ${minLeftPanelWidth}`, async () => {
        await leftPanel.widthShouldBe(minLeftPanelWidth);
      });
  
      await h(t).withLog('When loginUser expand left panel', async () => {
        await app.homePage.leftPanel.expand();
      });

      await h(t).withLog(`Then width of left panel should be ${maxLeftPanelWidth}`, async () => {
        await leftPanel.widthShouldBe(maxLeftPanelWidth);
      });

      await h(t).withLog(`When loginUser log out and login Jupiter with ${otherUser.company.number}#${otherUser.extension}`, async () => {
        await app.homePage.logoutThenLoginWithUser(SITE_URL, otherUser);
        await app.homePage.ensureLoaded();
      });

      await h(t).withLog(`Then width of left panel should be ${minLeftPanelWidth}`, async () => {
        await leftPanel.widthShouldBe(minLeftPanelWidth);
      });

      await h(t).withLog(`When otherUser log out and login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
        await app.homePage.logoutThenLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      });
  
      await h(t).withLog(`Then width of left panel should be ${maxLeftPanelWidth}`, async () => {
        await leftPanel.widthShouldBe(maxLeftPanelWidth);
      });
  
    });
  

test(
  formalName('reload page keep left panel state', ['P2', 'JPT-38']), async (t) => {
    const minLeftPanelWidth = 72;
    const maxLeftPanelWidth = 200;

    const app = new AppRoot(t);
    const loginUser = h(t).rcData.mainCompany.users[0];

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    }, true);

    const leftPanel = app.homePage.leftPanel;

    await h(t).withLog('When I fold left panel', async () => {
      await leftPanel.fold();
    });

    await h(t).withLog(`Then width of left panel should be ${minLeftPanelWidth}`, async () => {
      await leftPanel.widthShouldBe(minLeftPanelWidth);
    });

    await h(t).withLog('When I refresh browser', async () => {
      await h(t).reload();
      await leftPanel.ensureLoaded();
    });

    await h(t).withLog(`Then width of left panel should be ${minLeftPanelWidth}`, async () => {
      await leftPanel.widthShouldBe(minLeftPanelWidth);
    });

    await h(t).withLog('When I expand left panel', async () => {
      await app.homePage.leftPanel.expand();
    });

    await h(t).withLog(`Then width of left panel should be ${maxLeftPanelWidth}`, async () => {
      await leftPanel.widthShouldBe(maxLeftPanelWidth);
    });

    await h(t).withLog('When I refresh browser', async () => {
      await h(t).reload();
      await leftPanel.ensureLoaded();
    });

    await h(t).withLog(`Then width of left panel should be ${maxLeftPanelWidth}`, async () => {
      await leftPanel.widthShouldBe(maxLeftPanelWidth);
    });
  });
