/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-17 18:11:46
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../../api';
import { loginRCByPassword, loginGlip2ByPassword, refreshToken } from '../login';
import { NETWORK_VIA } from 'foundation';

jest.mock('../../api');

describe('login', () => {
  describe('loginRCByPassword()', () => {
    it('rcNetworkClient http() should be called with specific path', () => {
      loginRCByPassword({ username: 'aaa', password: '123' });
      expect(Api.rcNetworkClient.http).toHaveBeenCalledWith({
        authFree: true,
        data: { grant_type: 'password', password: '123', username: 'aaa' },
        method: 'post',
        path: '/oauth/token',
        via: NETWORK_VIA.HTTP
      });
    });
  });
  describe('loginGlip2ByPassword()', () => {
    it('glip2NetworkClient http() should be called with specific path', () => {
      loginGlip2ByPassword({ username: 'aaa', password: '123' });
      expect(Api.glip2NetworkClient.http).toHaveBeenCalledWith({
        authFree: true,
        data: { grant_type: 'password', password: '123', username: 'aaa' },
        method: 'post',
        path: '/oauth/token',
        via: NETWORK_VIA.HTTP
      });
    });
  });
  describe('refreshToken()', () => {
    it('glip2NetworkClient http() should be called with specific path', () => {
      refreshToken({ username: 'aaa', password: '123' });
      expect(Api.glip2NetworkClient.http).toHaveBeenCalledWith({
        authFree: true,
        data: { grant_type: 'password', password: '123', username: 'aaa' },
        method: 'post',
        via: NETWORK_VIA.HTTP,
        path: '/oauth/token'
      });
    });
  });
});
