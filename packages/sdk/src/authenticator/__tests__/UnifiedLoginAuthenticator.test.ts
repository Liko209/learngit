/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:36:19
 * Copyright © RingCentral. All rights reserved
 */

import { loginGlip } from '../../api/glip/user';
import { Api } from '../../api';

import { UnifiedLoginAuthenticator } from '..';
import {
  generateCode,
  oauthTokenViaAuthCode,
} from '../../api/ringcentral/auth';
import {
  NetworkManager,
  OAuthTokenManager,
  HttpResponseBuilder,
  HttpResponse,
} from 'foundation';
import { ApiResultOk } from '../../api/ApiResult';
import { GlobalConfigService } from '../../module/config';

jest.mock('../../module/config');
jest.mock('../../service/account/config');
GlobalConfigService.getInstance = jest.fn();

const networkManager = new NetworkManager(new OAuthTokenManager());

jest.mock('../../api/glip/user', () => ({
  loginGlip: jest.fn(),
}));

jest.mock('../../api/ringcentral/auth', () => ({
  oauthTokenViaAuthCode: jest.fn(),
  generateCode: jest.fn(),
}));

function createResponse(obj: any) {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('UnifiedLoginAuthenticator', () => {
  const unified = new UnifiedLoginAuthenticator();
  it('UnifiedLoginAuthenticator invalid tokens', async () => {
    const resp = await unified.authenticate({});
    expect(resp.success).toBe(false);
  });
  it('UnifiedLoginAuthenticator rc account', async () => {
    const oauthTokenResult = new ApiResultOk(
      {
        access_token: 113123,
      },
      createResponse({ status: 200, headers: {} }),
    );
    const loginGlipResult = new ApiResultOk(
      '',
      createResponse({
        status: 200,
        headers: {
          'x-authorization': 'glip_token',
        },
      }),
    );
    const generateCodeResult = new ApiResultOk(
      {
        code: 'code',
      },
      createResponse({
        status: 200,
        headers: {},
      }),
    );

    oauthTokenViaAuthCode.mockResolvedValue(oauthTokenResult);
    generateCode.mockResolvedValueOnce(generateCodeResult);
    loginGlip.mockResolvedValueOnce(loginGlipResult);
    Api.init({}, networkManager);

    const resp = await unified.authenticate({ code: '123' });
    expect(resp.success).toBe(true);
    expect(resp.accountInfos.length).toBe(2);
  });
  it('UnifiedLoginAuthenticator glip account', async () => {
    const resp = await unified.authenticate({ token: '123' });
    expect(resp.success).toBe(true);
  });
});
