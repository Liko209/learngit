import 'testcafe';
import axios from 'axios';
import { URL } from 'url';
import { IUser } from '../models';
import { BlankPage } from '../../page-models/pages/BlankPage';

export class JupiterHelper {

  static urlToRedirectUriState(url: URL) {
    const state = url.pathname + url.search.replace('&', '$') + url.hash;
    const redirectUri = url.origin;
    return { state, redirectUri };
  }

  constructor(private t: TestController) {
   }

  get authUrl(): string {
    return this.t.ctx.__authUrl;
  }

  set authUrl(authUrl: string) {
    this.t.ctx.__authUrl = authUrl;
  }

  get appClientId(): string {
    return this.t.ctx.__appClientId;
  }

  set appClientId(appClientId: string) {
    this.t.ctx.__appClientId = appClientId;
  }

  async setup(authUrl: string, appClientId: string) {
    this.authUrl = authUrl;
    this.appClientId = appClientId;
  }

  async getUrlWithAuthCode(redirectUrl: string, user: IUser, ) {
    const { state, redirectUri } = JupiterHelper.urlToRedirectUriState(new URL(redirectUrl));
    const data = {
      state,
      username: user.company.number || user.email,
      password: user.password,
      autoLogin: false,
      ibb: '',
      sddi: '',
      prompt: 'login sso',
      display: 'touch',
      clientId: this.appClientId,
      appUrlScheme: redirectUri,
      responseType: 'code',
      responseHint: '',
      glipAuth: true,
      localeId: 'en_US',
    };
    if (user.extension && user.company.number) {
      data['extension'] = user.extension;
    }
    const response = await axios.post(this.authUrl, data);
    return response.data.redirectUri;
  }

  directLoginWithUser(url: string, user: IUser) {
    return new BlankPage(this.t)
      .log(`account: ${user.company.number} extension: ${user.extension}`)
      .chain(async t => {
        const urlWithAuthCode = await this.getUrlWithAuthCode(url, user);
        await t.navigateTo(urlWithAuthCode);
      });
  }

}
