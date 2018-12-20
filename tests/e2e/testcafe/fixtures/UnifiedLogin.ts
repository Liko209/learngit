/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:30:30
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../libs/filter';
import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { SITE_URL, BrandTire, SITE_ENV } from '../config';

fixture('Unified Login')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Unified Login', ['JPT-67', 'P0', 'Login']), async (t) => {
  const user = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog('Given I login Jupiter interactively', async () => {
    await h(t).jupiterHelper.selectEnvironment(SITE_URL, SITE_ENV);
    await app.loginPage.interactiveSignIn(user.company.number, user.extension, user.password);
  });

  await h(t).withLog('Then I should find state params in url before enter home page', async () => {
    await t.expect(h(t).href).contains('state=');
  });

  await h(t).withLog('And I should enter home page after loading is finish', async () => {
    await app.homePage.ensureLoaded();
  });
});