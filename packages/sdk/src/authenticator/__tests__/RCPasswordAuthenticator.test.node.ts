/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:36:19
 * Copyright © RingCentral. All rights reserved
 */
import { HttpResponseBuilder, HttpResponse } from 'foundation/network';
import { loginGlip, ITokenModel, RCAuthApi } from '../../api';
import { RCPasswordAuthenticator } from '..';
import { ServiceLoader, ServiceConfig } from '../../module/serviceLoader';
import { AuthUserConfig } from '../../module/account/config/AuthUserConfig';
import { AccountUserConfig } from '../../module/account/config/AccountUserConfig';
jest.mock('../../module/config');

jest.mock('../../api');

function createResponse(obj: any) {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('RCPasswordAuthenticator', () => {
  beforeEach(() => {
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return {
            userConfig: AccountUserConfig.prototype,
            authUserConfig: AuthUserConfig.prototype,
          };
        }
      });
  });

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
    };
    const loginGlipResult = createResponse({
      status: 200,
      headers: {
        'x-authorization': 'glip_token',
      },
    });

    RCAuthApi.loginRCByPassword.mockResolvedValueOnce(loginRCResult);
    loginGlip.mockResolvedValueOnce(loginGlipResult);

    const rc = new RCPasswordAuthenticator();
    const resp = await rc.authenticate({
      username: '18662032065',
      password: '123123',
    });
    expect(resp).toEqual({
      success: true,
      isFirstLogin: true,
      accountInfos: [
        {
          data: {
            access_token: 'rc_token',
            endpoint_id: 'endpoint_id',
            expires_in: 1,
            owner_id: 'owner_id',
            refresh_token: 'refresh_token',
            refresh_token_expires_in: 1,
            scope: 'scope',
            timestamp: 1,
            token_type: 'token_type',
          },
          type: 'RCAccount',
        },
        { data: {}, type: 'GlipAccount' },
      ],
    });
  });

  describe('parsePhoneNumber()', () => {
    const rc = new RCPasswordAuthenticator();
    expect(rc.parsePhoneNumber('8778062222')).toEqual('18778062222');
    expect(rc.parsePhoneNumber('222')).toEqual('222');
  });
});
