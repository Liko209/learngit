/*
 * @Author: Paynter Chen
 * @Date: 2019-08-20 16:33:41
 * Copyright © RingCentral. All rights reserved.
 */
import { getAppContextInfo, getApplicationInfo } from '../helper';
import { ServiceLoader } from 'sdk/module/serviceLoader/ServiceLoader';
import { AccountService } from 'sdk/module/account/service/AccountService';
import _ from 'lodash';

jest.mock('sdk/module/serviceLoader/ServiceLoader');
jest.mock('sdk/module/log/utils', () => {
  return {
    getClientId: () => 'mock-client-id',
  };
});
jest.mock('ua-parser-js', () => {
  return {
    UAParser: () => ({
      getBrowser: () => ({
        name: 'WebKit',
        version: '537.36',
      }),
      getOS: () => 'MacOs',
    }),
  };
});
jest.mock('@/config', () => ({
  getEnv: jest.fn(() => {
    return 'test-env';
  }),
}));
// const config = await import('@/config');

describe('helper', () => {
  const APPLICATION_KEYS = [
    'env',
    'version',
    'url',
    'platform',
    'browser',
    'os',
    'clientId',
  ];
  const USER_KEYS = ['email', 'username', 'id', 'companyId'];
  const CONTEXT_KEYS = [...APPLICATION_KEYS, ...USER_KEYS];
  const accountService: AccountService = {
    getCurrentUserInfo: jest.fn(() => Promise.resolve({})),
  } as any;
  ServiceLoader.getInstance.mockReturnValue(accountService);
  describe('getAppContextInfo()', () => {
    it('should contain keys', async () => {
      const info = await getAppContextInfo();
      expect(_.union(Object.keys(info), CONTEXT_KEYS).length).toEqual(
        CONTEXT_KEYS.length,
      );
    });
  });
  describe('getApplicationInfo()', () => {
    it('should contain keys', async () => {
      const info = await getApplicationInfo();
      expect(_.union(Object.keys(info), APPLICATION_KEYS).length).toEqual(
        APPLICATION_KEYS.length,
      );
    });
  });
});
