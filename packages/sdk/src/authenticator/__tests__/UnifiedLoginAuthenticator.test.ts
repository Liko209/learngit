/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:36:19
 * Copyright © RingCentral. All rights reserved
 */

import { loginGlip } from '../../api/glip/user';
import { Api, RCAuthApi } from '../../api';

import { UnifiedLoginAuthenticator } from '..';
import {
  NetworkManager,
  OAuthTokenManager,
  HttpResponseBuilder,
  HttpResponse,
} from 'foundation';
import { GlobalConfigService } from '../../module/config';

const networkManager = new NetworkManager(new OAuthTokenManager());

jest.mock('../../module/config');
jest.mock('../../api/ringcentral/RCAuthApi');
jest.mock('../../api/glip/user', () => ({
  loginGlip: jest.fn(),
}));

GlobalConfigService.getInstance = jest.fn();

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
    jest
      .spyOn(unified, '_requestRCAccountRelativeInfo')
      .mockImplementationOnce(() => {});

    const resp = await unified.authenticate({ code: '123' });
    expect(resp.success).toBe(true);
    expect(resp.accountInfos!.length).toBe(2);
    expect(unified['_requestRCAccountRelativeInfo']).toBeCalled();
  });
  it('UnifiedLoginAuthenticator rc account and glip failed', async () => {
    loginGlip.mockImplementation(() => {
      throw Error('failed');
    });
    Api.init({}, networkManager);
    jest
      .spyOn(unified, '_requestRCAccountRelativeInfo')
      .mockImplementationOnce(() => {});

    // todo: for now, ui can not support the rc only mode
    // so will throw error to logout when glip is down
    try {
      await unified.authenticate({ code: '123' });
    } catch (err) {}
  });
  it('UnifiedLoginAuthenticator glip account', async () => {
    const resp = await unified.authenticate({ token: '123' });
    expect(resp.success).toBe(true);
  });
});
