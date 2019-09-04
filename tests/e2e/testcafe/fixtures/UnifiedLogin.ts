/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:30:30
 * Copyright © RingCentral. All rights reserved.
 */

import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { SITE_URL, BrandTire, SITE_ENV } from '../config';
import { ITestMeta } from "../v2/models";

fixture('Unified Login')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-67'],
  keywords: ['login']
})('Unified Login', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog('Given I login Jupiter interactively with user {number}#{extension}', async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).jupiterHelper.selectEnvironment(SITE_URL, SITE_ENV);
    await app.loginPage.interactiveSignIn(loginUser.company.number, loginUser.extension, loginUser.password);
  });

  await h(t).withLog('Then I should find state params in url before enter home page', async () => {
    await t.expect(h(t).href).contains('state=');
  });

  await h(t).withLog('And I should enter home page after loading is finish', async () => {
    await app.homePage.ensureLoaded();
  });
});

fixture('Unified Login')
  .beforeEach(setupCase(BrandTire.GLIP_FREE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-68'],
  keywords: ['login']
})('Unified Login with glip free account', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog('Given I login Jupiter interactively with user {email}', async (step) => {
    step.initMetadata({
      email: loginUser.email,
    });
    await h(t).jupiterHelper.selectEnvironment(SITE_URL, SITE_ENV);
    await app.loginPage.interactiveEmailSignIn(loginUser.email, loginUser.password);
  });

  await h(t).withLog('Then I should find state params in url before enter home page', async () => {
    await t.expect(h(t).href).contains('state=');
  });

  await h(t).withLog('And I should enter home page after loading is finish', async () => {
    await app.homePage.ensureLoaded();
  });
});