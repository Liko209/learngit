/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-17 18:11:46
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../../api';
import { oauthTokenViaAuthCode, generateCode } from '../auth';
import { NETWORK_VIA, NETWORK_METHOD } from 'foundation';

jest.mock('../../api');

describe('auth', () => {
  describe('oauthTokenViaAuthCode()', () => {
    it('glipNetworkClient http() should be called with specific path', () => {
      oauthTokenViaAuthCode({ name: 'aaa' }, { auth: 'xxxx' });
      expect(Api.rcNetworkClient.http).toHaveBeenCalledWith({
        authFree: true,
        data: { grant_type: 'authorization_code', name: 'aaa' },
        headers: { auth: 'xxxx' },
        method: 'post',
        via: NETWORK_VIA.HTTP,
        path: '/oauth/token',
      });
    });
  });
  describe('generateCode()', () => {
    it('glipNetworkClient get() should be called with specific path', () => {
      generateCode('123123', '456456');
      expect(Api.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.x/v1.0/interop/generate-code',
        method: NETWORK_METHOD.POST,
        via: NETWORK_VIA.HTTP,
        data: {
          clientId: '123123',
          redirectUri: '456456',
        },
      });
    });
  });
});
