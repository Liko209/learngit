/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:36:19
 * Copyright © RingCentral. All rights reserved
 */

import { loginRCByPassword, ITokenModel } from '../../api/ringcentral/login';
import { loginGlip } from '../../api/glip/user';
import { RCPasswordAuthenticator } from '..';
import { NetworkResultOk } from '../../api/NetworkResult';

jest.mock('../../api/glip/user', () => ({
  loginGlip: jest.fn(),
}));

jest.mock('../../api/ringcentral/login', () => ({
  loginRCByPassword: jest.fn(),
}));

describe('RCPasswordAuthenticator', () => {
  it('should login success', async () => {
    const loginRCResult = new NetworkResultOk<ITokenModel>(
      {
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
      },
      200,
      {},
    );
    const loginGlipResult = new NetworkResultOk({}, 200, {
      'x-authorization': 'glip_token',
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
