/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { BlankPage } from '../page-models/BlankPage';
import { EnvironmentSelectionPage } from '../page-models/EnvironmentSelectionPage';
import { RingcentralSignInNavigationPage } from '../page-models/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/RingcentralSignInPage';

fixture('My fixture');

test('Sign In Success', async (t) => {
  await new BlankPage(t)
    .open('https://develop.fiji.gliprc.com/unified-login')
    .shouldNavigateTo(EnvironmentSelectionPage)
    .selectEnvironment('XMN-UP')
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .setCredential('18662118607')
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension('701')
    .setPassword('Test!123')
    .signIn()
    .execute();
});
