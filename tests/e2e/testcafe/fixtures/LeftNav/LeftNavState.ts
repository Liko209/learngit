/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-11 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL } from '../../config';

fixture('LeftNav')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(
  formalName('reload page keep left nav state', ['P2', 'JPT-38', 'left nav state']), async (t) => {
    const minSize = 72;
    const maxSize = 200;

    // every test case should start with following lines
    const user = h(t).rcData.mainCompany.users[4];
    const app = new AppRoot(t);

    // using Given-When-Then statements to write report
    await h(t).withLog(`Given I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
      await h(t).log('success to login jupiter', true);
    }, true);

    await h(t).withLog('When I collapse left panel', async () => {
      await app.homePage.leftPanel.fold();
    });
    await h(t).withLog(`Then size = ${minSize}`, async () => {
      //TODO expect size =72 
    });
    await h(t).withLog('When I refresh page', async () => {
      //TODO refresh page
    });
    await h(t).withLog(`Then size = ${minSize}`, async () => {
      //TODO expect size =72 
    });
    await h(t).withLog('When I expand left panel', async () => {
      await app.homePage.leftPanel.expand();
    });
    await h(t).withLog(`Then size = ${maxSize}`, async () => {
      //TODO expect size =72 
    });
    await h(t).withLog('When I refresh page', async () => {
      //TODO refresh page
    });
    await h(t).withLog(`Then size = ${maxSize}`, async () => {
      //TODO expect size =200 
    });

  });
