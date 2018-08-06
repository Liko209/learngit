import { BlankPage } from '../page-models/BlankPage';
import { RingcentralSignInNavigationPage } from '../page-models/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/RingcentralSignInPage';


fixture("My fixture")

test('Sign In', async t => {
    await new BlankPage(t)
      .open('https://develop.fiji.gliprc.com/unified-login')
      .shouldNavigateTo(RingcentralSignInNavigationPage)
      .setCredential('12345678910')
      .toNextPage()
      .shouldNavigateTo(RingcentralSignInPage);
});
