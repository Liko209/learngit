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
import { NetworkManager, OAuthTokenManager } from 'foundation';
import { NetworkResultOk } from '../../api/NetworkResult';

const networkManager = new NetworkManager(new OAuthTokenManager());

jest.mock('../../api/glip/user', () => ({
  loginGlip: jest.fn(),
}));

jest.mock('../../api/ringcentral/auth', () => ({
  oauthTokenViaAuthCode: jest.fn(),
  generateCode: jest.fn(),
}));

describe('UnifiedLoginAuthenticator', () => {
  const unified = new UnifiedLoginAuthenticator();
  it('UnifiedLoginAuthenticator invalid tokens', async () => {
    const resp = await unified.authenticate({});
    expect(resp.success).toBe(false);
  });
  it('UnifiedLoginAuthenticator rc account', async () => {
    const oauthTokenResult = new NetworkResultOk({ data: 'token' }, 200, {});
    const oauthTokenResult = new NetworkResultOk({ data: 'token' }, 200, {});
    const generateCodeResult = new NetworkResultOk(
      {
        data: 'glip_token',
      },
      200,
      {
        'x-authorization': 'glip_token',
      },
    );

    oauthTokenViaAuthCode.mockResolvedValue(oauthTokenResult);
    generateCode.mockResolvedValueOnce({
      data: {
        code: 'code',
      },
    });
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
