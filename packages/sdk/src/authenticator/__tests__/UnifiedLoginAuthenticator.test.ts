/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:36:19
 * Copyright © RingCentral. All rights reserved
*/

import { loginGlip } from '../../api/glip/user';
import { Api } from '../../api';

import { UnifiedLoginAuthenticator } from '..';
import { generateCode, oauthTokenViaAuthCode } from '../../api/ringcentral/auth';

jest.mock('../../api/glip/user', () => ({
  loginGlip: jest.fn()
}));

jest.mock('../../api/ringcentral/auth', () => ({
  oauthTokenViaAuthCode: jest.fn(),
  generateCode: jest.fn()
}));

describe('UnifiedLoginAuthenticator', () => {
  let unified = new UnifiedLoginAuthenticator();
  it('UnifiedLoginAuthenticator invalid tokens', async () => {
    const resp = await unified.authenticate({});
    expect(resp.success).toBe(false);
  });
  it('UnifiedLoginAuthenticator rc account', async () => {
    oauthTokenViaAuthCode.mockResolvedValue({ data: 'token' });
    generateCode.mockResolvedValueOnce({
      data: {
        code: 'code'
      }
    });
    loginGlip.mockResolvedValueOnce({
      headers: {
        'x-authorization': 'glip_token'
      }
    });
    Api.init({});

    const resp = await unified.authenticate({ code: '123' });
    expect(resp.success).toBe(true);
    expect(resp.accountInfos.length).toBe(2);
  });
  it('UnifiedLoginAuthenticator glip account', async () => {
    const resp = await unified.authenticate({ token: '123' });
    expect(resp.success).toBe(true);
  });
});
