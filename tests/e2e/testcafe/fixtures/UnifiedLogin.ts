import { BlankPage } from '../page-models/BlankPage';
import { UnifiedLoginPage } from '../page-models/UnifiedLoginPage';
import { RingcentralSignInNavigationPage } from '../page-models/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/RingcentralSignInPage';
import { SITE_URL, SITE_ENV } from '../config';

import { formalName } from '../libs/filter';
import { setUp, tearDown, TestHelper } from '../libs/helpers';

fixture('ConversationList')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

test(formalName('Sign In Success', ['P0', 'SignIn']), async t => {
  const helper = TestHelper.from(t);

  await new BlankPage(t)
    .open(SITE_URL)
    .shouldNavigateTo(UnifiedLoginPage)
    .clickLogin()
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .setCredential(helper.companyNumber)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension(helper.users.user701.extension)
    .setPassword(helper.users.user701.password)
    .signIn();
});
