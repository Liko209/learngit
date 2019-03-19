/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-17 18:11:46
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../../api';
import { loginGlip, indexData } from '../user';

jest.mock('../../api');

describe('UserAPI', () => {
  describe('loginGlip()', () => {
    it('glipNetworkClient rawRequest() should be called with specific path', async () => {
      await loginGlip({ auth: 'asdfsd' });
      expect(Api.glipNetworkClient.rawRequest).toHaveBeenCalledWith({
        authFree: true,
        data: { rc_access_token_data: 'eyJhdXRoIjoiYXNkZnNkIn0=' },
        method: 'put',
        path: '/login',
        via: 0,
      });
    });
  });
  describe('indexData()', () => {
    it('glipNetworkClient get() should be called with specific path', async () => {
      const mock = { id: 111 };
      const requestConfig = {};
      const header = {};
      await indexData(mock);
      expect(Api.glipNetworkClient.get).toHaveBeenCalledWith(
        '/index',
        mock,
        0,
        requestConfig,
        header,
        3,
      );
    });
  });
});
