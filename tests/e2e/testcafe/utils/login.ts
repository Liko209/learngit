/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:46:24
 * Copyright © RingCentral. All rights reserved.
 */
import { URL } from 'url';
import axios from 'axios';
import { Role } from 'testcafe';
import { SITE_URL, ENV } from '../config';
import { BlankPage } from '../page-models/pages/BlankPage';
import { RingcentralSignInNavigationPage } from '../page-models/pages/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/pages/RingcentralSignInPage';
import { UnifiedLoginPage } from '../page-models/pages/UnifiedLoginPage';
import { TokenGetterPage } from '../page-models/pages/TokenGetterPage';
import { Home } from '../page-models/components/Home';

import { TestHelper } from '../libs/helpers';

type AuthInfo = {
  credential: string;
  extension?: string;
  password: string;
};

function urlToRedirectUriAndState(url: URL) {
  const state = url.pathname + url.search.replace('&', '$') + url.hash;
  const redirectUri = url.origin;
  return { state, redirectUri };
}

async function getUrlWithAuthCode(
  redirectUrl: string,
  authInfo: AuthInfo,
  authUrl: string = ENV.AUTH_URL,
  appClientId: string = ENV.JUPITER_APP_KEY,
) {
  const { state, redirectUri } = urlToRedirectUriAndState(new URL(redirectUrl));
  const data = {
    state,
    username: authInfo.credential,
    password: authInfo.password,
    autoLogin: false,
    ibb: '',
    sddi: '',
    prompt: 'login sso',
    display: 'touch',
    clientId: appClientId,
    appUrlScheme: redirectUri,
    responseType: 'code',
    responseHint: '',
    glipAuth: true,
    localeId: 'en_US',
  };
  if (authInfo.extension !== undefined) {
    data['extension'] = authInfo.extension;
  }
  const response = await axios.post(authUrl, data);
  return response.data.redirectUri;
}

function createRole(authInfo?: AuthInfo) {
  return Role(
    SITE_URL,
    async t => await interactiveLogin(t, authInfo),
  );
}

function interactiveLogin(t: TestController, authInfo?: AuthInfo) {
  let credential: string = '';
  let extension: string = '';
  let password: string = '';

  if (authInfo) {
    ({ credential, password } = authInfo);
    extension = authInfo.extension || '';
  } else {
    const helper = TestHelper.from(t);
    credential = helper.companyNumber;
    extension = helper.users.user701.extension;
    password = helper.users.user701.password;
  }

  return new BlankPage(t)
    .log(`account: ${credential} extension: ${extension}`)
    .navigateTo(SITE_URL)
    .shouldNavigateTo(UnifiedLoginPage)
    .clickLogin()
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .cleanInput()
    .setCredential(credential)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension(extension)
    .setPassword(password)
    .signIn()
    .log('fetch rc token and glip token')
    .shouldNavigateTo(TokenGetterPage)
    .expectUrlParamsIsCorrect()
    .log('expect exist home react component')
    .shouldNavigateTo(Home)
    .expectExistComponent();

}

function directLogin(t: TestController, authInfo?: AuthInfo) {
  let credential: string = '';
  let extension: string = '';
  let password: string = '';

  if (authInfo) {
    ({ credential, password } = authInfo);
    extension = authInfo.extension || '';
  } else {
    const helper = TestHelper.from(t);
    credential = helper.companyNumber;
    extension = helper.users.user701.extension;
    password = helper.users.user701.password;
  }
  return new BlankPage(t)
    .log(`account: ${credential} extension: ${extension}`)
    .chain(async (t) => {
      const urlWithAuthCode = await getUrlWithAuthCode(SITE_URL, { credential, extension, password });
      await t.navigateTo(urlWithAuthCode);
    })
    .shouldNavigateTo(TokenGetterPage);
}

export { AuthInfo, interactiveLogin, createRole, directLogin };
