/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:36:19
 * Copyright © RingCentral. All rights reserved
 */

import { loginGlip } from '../../api/glip/user';
import { Api, RCAuthApi, RCInfoApi } from '../../api';

import { UnifiedLoginAuthenticator } from '..';
import {
  NetworkManager,
  OAuthTokenManager,
  HttpResponseBuilder,
  HttpResponse,
} from 'foundation/network';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { AccountGlobalConfig } from 'sdk/module/account/config';
import { setRCToken, setRCAccountType } from '../utils';

const networkManager = new NetworkManager(new OAuthTokenManager());

jest.mock('sdk/service/notificationCenter');
jest.mock('../../module/config');
jest.mock('../../api/ringcentral/RCAuthApi');
jest.mock('../../api/glip/user', () => ({
  loginGlip: jest.fn(),
}));

function createResponse(obj: any) {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('UnifiedLoginAuthenticator', () => {
  const unified = new UnifiedLoginAuthenticator();
  const accoutService = new AccountService();
  const mockRCInfoService = {
    requestRCAccountRelativeInfo: jest.fn(),
    getRCExtensionInfo: jest.fn(),
    getUserEmail: jest.fn(),
  } as any;
  ServiceLoader.getInstance = jest.fn().mockImplementation((config: string) => {
    if (config === ServiceConfig.ACCOUNT_SERVICE) {
      return accoutService;
    }
    if (config === ServiceConfig.RC_INFO_SERVICE) {
      return mockRCInfoService;
    }
  });

  it('UnifiedLoginAuthenticator invalid tokens', async () => {
    const resp = await unified.authenticate({});
    expect(resp).toEqual({
      success: false,
      error: new Error('invalid tokens'),
    });
  });

  it('UnifiedLoginAuthenticator rc account', async () => {
    const oauthTokenResult = {
      access_token: 113123,
    };
    const loginGlipResult = createResponse({
      status: 200,
      headers: {
        'x-authorization': 'glip_token',
      },
    });

    RCAuthApi.oauthTokenViaAuthCode.mockResolvedValue(oauthTokenResult);
    loginGlip.mockResolvedValueOnce(loginGlipResult);
    Api.init({}, networkManager);
    jest.spyOn(unified, '_requestRCAccountRelativeInfo');
    RCInfoApi.requestRCAPIVersion = jest.fn();
    AccountGlobalConfig.setUserDictionary = jest.fn();
    mockRCInfoService.getRCExtensionInfo = jest
      .fn()
      .mockReturnValue({ id: 123 });
    setRCToken = jest.fn();
    setRCAccountType = jest.fn();
    mockRCInfoService.getUserEmail = jest.fn();

    const resp = await unified.authenticate({ code: '123' });
    expect(resp.success).toEqual(true);
    expect(resp.isFirstLogin).toEqual(true);
    expect(resp.isRCOnlyMode).toEqual(true);
    expect(resp.accountInfos!.length).toEqual(1);
    expect(unified['_requestRCAccountRelativeInfo']).toBeCalled();
    expect(RCInfoApi.requestRCAPIVersion).toBeCalled();
    expect(AccountGlobalConfig.setUserDictionary).toBeCalled();
  });

  it('UnifiedLoginAuthenticator glip account', async () => {
    const resp = await unified.authenticate({ token: '123' });
    expect(resp).toEqual({
      success: true,
      isFirstLogin: true,
      accountInfos: [{ data: '123', type: 'GlipAccount' }],
    });
  });
});
