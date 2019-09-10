import 'testcafe';
import * as _ from 'lodash';
import { Selector, ClientFunction } from 'testcafe';
import axios from 'axios';
import { URL } from 'url';
import { IUser } from '../models';
import { ENV_OPTS, SITE_URL } from '../../config';

export class JupiterHelper {

  static urlToRedirectUriState(url: URL) {
    const state = url.pathname + url.search.replace('&', '$') + url.hash;
    const redirectUri = url.origin;
    return { state, redirectUri };
  }

  constructor(private t: TestController) { }

  get siteEnv(): string {
    return this.t.ctx.__siteEnv;
  }

  set siteEnv(siteEnv: string) {
    this.t.ctx.__siteEnv = siteEnv;
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

  get mockRequestId(): string {
    return this.t.ctx.__mockRequestId;
  }

  set mockRequestId(mockRequestId: string) {
    this.t.ctx.__mockRequestId = mockRequestId;
  }

  async setup(siteEnv: string, authUrl: string, appClientId: string) {
    this.siteEnv = siteEnv;
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

    const getRCAuthSession = async (): Promise<string> => {
      const loginSite = new URL(this.authUrl);
      const siteUrl = new URL(SITE_URL);
      const siteHost = `${siteUrl.origin}`
      let response = await axios.get(`${loginSite.origin}/mobile/loginDispatcher`,
        {
          params: {
            responseType: 'code',
            clientId: ENV_OPTS.JUPITER_APP_KEY,
            brandId: 1210,
            appUrlScheme: siteHost,
            glipAppRedirectURL: `${siteHost}?t=`,
            state: `/?env=${this.siteEnv}`,
            localeId: "en_US",
            display: "touch",
            prompt: "login sso",
            scope: "",
            ui_options: "external_popup remember_me_on show_back_to_app hide_consent",
            code_challenge: "",
            code_challenge_method: "",
            hideNavigationBar: [true, true],
            glip_auth: true,
            response_hint: "remember_me+login_type",
            force: true,
            title_bar: true
          }
        }
      );

      const cookies = [];
      if (response.headers['set-cookie']) {
        for (let item of response.headers['set-cookie']) {
          if (item.startsWith('RCAuthSession')) {
            cookies.push(item.split(';')[0]);
            break;
          }
        }
      }

      return cookies.join(';');
    }
    const cookie = await getRCAuthSession();
    const response = await axios.post(this.authUrl, data, {
      headers: {
        'x-mock-request-id': this.mockRequestId || 'no mock',
        "Cookie": cookie,
      }
    });
    return response.data.redirectUri;
  }

  async directLoginWithUser(url: string, user: IUser) {
    await this.selectEnvironment(url, this.siteEnv);
    const urlWithAuthCode = await this.getUrlWithAuthCode(url, user);
    await this.t.navigateTo(urlWithAuthCode);
  }

  async selectEnvironment(url: string, env: string) {
    const envSelect = Selector('select');
    const envOption = envSelect.find('option');
    await this.t
      .navigateTo(url)
      .click(envSelect)
      .click(envOption.withText(env))
    await ClientFunction(() => localStorage.setItem('global.config.RUNNING_E2E', 'true'))();
  }
}
