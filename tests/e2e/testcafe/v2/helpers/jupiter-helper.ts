import 'testcafe';
import { Selector, RequestHook } from 'testcafe';
import axios from 'axios';
import { URL } from 'url';
import { IUser } from '../models';
import { SITE_ENV, ENV_OPTS, MOCK_AUTH_URL, MOCK_ENV } from '../../config';
import { MockClient, BrowserInitDto } from 'mock-client';

class MockClientHook extends RequestHook {
  public requestId: string;

  onRequest(event) {
    event.requestOptions.headers['x-mock-request-id'] = this.requestId;
  }

  onResponse(event) {
  }
}

export class JupiterHelper {

  static urlToRedirectUriState(url: URL) {
    const state = url.pathname + url.search.replace('&', '$') + url.hash;
    const redirectUri = url.origin;
    return { state, redirectUri };
  }

  constructor(private t: TestController) { }

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

  get mockClient(): MockClient {
    return this.t.ctx.__mockClient;
  }

  set mockClient(mockClient: MockClient) {
    this.t.ctx.__mockClient = mockClient;
  }

  async setup(authUrl: string, appClientId: string, mockClient: MockClient) {
    this.authUrl = authUrl;
    this.appClientId = appClientId;
    this.mockClient = mockClient;
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
    const response = await axios.post(this.authUrl, data, {
      headers: {
        'x-mock-request-id': this.mockClient['requestId']
      }
    });
    return response.data.redirectUri;
  }

  async directLoginWithUser(url: string, user: IUser, env: string = SITE_ENV) {
    if (this.mockClient) {
      const initDto = BrowserInitDto.of()
        .env(env)
        .appKey(ENV_OPTS.RC_PLATFORM_APP_KEY)
        .appSecret(ENV_OPTS.RC_PLATFORM_APP_SECRET);

      this.mockClient['requestId'] = await this.mockClient.registerBrowser(initDto);
      const hook = new MockClientHook();
      hook.requestId = this.mockClient['requestId'];
      await this.t.addRequestHooks([hook]);

      this.authUrl = MOCK_AUTH_URL;
      env = MOCK_ENV;
    }

    await this.selectEnvironment(url, env);
    const urlWithAuthCode = await this.getUrlWithAuthCode(url, user);
    await this.t.navigateTo(urlWithAuthCode);
  }

  async selectEnvironment(url: string, env: string) {
    const envSelect = Selector('select');
    const envOption = envSelect.find('option');
    await this.t
      .navigateTo(url)
      .click(envSelect)
      .click(envOption.withText(env));
  }
}
