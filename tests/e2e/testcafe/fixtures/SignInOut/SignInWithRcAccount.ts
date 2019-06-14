/*
 * @Author: Alexander Zaverukha(alexander.zaverukha@ringcentral.com)
 * @Date: 2019-05-03 11:30:18
 * Copyright © RingCentral. All rights reserved.
 */

import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire, SITE_ENV } from '../../config';
import {ITestMeta} from "../../v2/models";

fixture('SignInOut')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-69'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['SignInOut']
})('Sign in with RC account', async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog('Given I login to Unified login page with RC account correct password and without extension', async () => {
    await h(t).jupiterHelper.selectEnvironment(SITE_URL, SITE_ENV);
    await app.loginPage.interactiveSignIn(loginUser.company.number, "", loginUser.password);
  });

  await h(t).withLog('Then I should have success sign in', async () => {
    await app.homePage.ensureLoaded();
    await app.homePage.logout();
  });

  await h(t).withLog('When I login to Unified login page with RC account correct password and correct extension', async () => {
    await app.loginPage.interactiveSignIn(loginUser.company.number, loginUser.extension, loginUser.password);
  });

  await h(t).withLog('Then I should have success sign in', async () => {
    await app.homePage.ensureLoaded();
    await app.homePage.logout();
  });
});
