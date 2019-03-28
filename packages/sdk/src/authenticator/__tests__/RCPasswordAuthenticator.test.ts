/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:36:19
 * Copyright © RingCentral. All rights reserved
 */
import { HttpResponseBuilder, HttpResponse } from 'foundation';
import { loginRCByPassword, ITokenModel } from '../../api/ringcentral/login';
import { loginGlip } from '../../api/glip/user';
import { RCPasswordAuthenticator } from '..';

jest.mock('../../service/config/NewGlobalConfig');
jest.mock('../../module/config');

jest.mock('../../api/glip/user', () => ({
  loginGlip: jest.fn(),
}));

jest.mock('../../api/ringcentral/login', () => ({
  loginRCByPassword: jest.fn(),
}));

function createResponse(obj: any) {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('RCPasswordAuthenticator', () => {
  it('should login success', async () => {
    const loginRCResult: ITokenModel = {
      access_token: 'rc_token',
      endpoint_id: 'endpoint_id',
      expires_in: 1,
      owner_id: 'owner_id',
      refresh_token: 'refresh_token',
      refresh_token_expires_in: 1,
      scope: 'scope',
      token_type: 'token_type',
      timestamp: 1,
      accessTokenExpireIn: 2,
      refreshTokenExpireIn: 2,
    };
    const loginGlipResult = createResponse({
      status: 200,
      headers: {
        'x-authorization': 'glip_token',
      },
    });

    loginRCByPassword.mockResolvedValueOnce(loginRCResult);
    loginGlip.mockResolvedValueOnce(loginGlipResult);

    const rc = new RCPasswordAuthenticator();
    const resp = await rc.authenticate({
      username: '18662032065',
      password: '123123',
    });
    expect(resp.success).toBe(true);
  });

  describe('parsePhoneNumber()', () => {
    const rc = new RCPasswordAuthenticator();
    expect(rc.parsePhoneNumber('8778062222')).toEqual('18778062222');
    expect(rc.parsePhoneNumber('222')).toEqual('222');
  });
});
