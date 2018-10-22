/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:36:19
 * Copyright © RingCentral. All rights reserved
*/

import { loginRCByPassword } from '../../api/ringcentral/login';
import { loginGlip } from '../../api/glip/user';
import { RCPasswordAuthenticator } from '..';

jest.mock('../../api/glip/user', () => ({
  loginGlip: jest.fn(),
}));

jest.mock('../../api/ringcentral/login', () => ({
  loginRCByPassword: jest.fn(),
}));

describe('RCPasswordAuthenticator', () => {
  it('should login success', async () => {
    loginRCByPassword.mockResolvedValueOnce({
      data: 'rc_token',
    });
    loginGlip.mockResolvedValueOnce({
      headers: {
        'x-authorization': 'glip_token',
      },
    });

    const rc = new RCPasswordAuthenticator();
    const resp = await rc.authenticate({ username: '18662032065', password: '123123' });
    expect(resp.success).toBe(true);
  });

  describe('parsePhoneNumber()', () => {
    const rc = new RCPasswordAuthenticator();
    expect(rc.parsePhoneNumber('8778062222')).toEqual('18778062222');
    expect(rc.parsePhoneNumber('222')).toEqual('222');
  });
});
