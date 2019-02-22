/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 10:17:23
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import ConfigDao from '..';
import { setupKV } from '../../__tests__/utils';
import { ENV } from '../constants';

jest.mock('foundation');
jest.mock('../../../framework/dao');

describe('ConfigDao', () => {
  let configDao: ConfigDao;

  beforeAll(() => {
    const { kvStorage } = setupKV();
    configDao = new ConfigDao(kvStorage);
  });

  describe('putEnv()', () => {
    it('should set development as env', () => {
      configDao.putEnv('development');
      expect(configDao.put).toHaveBeenCalledWith(ENV, 'development');
    });
  });

  describe('getEnv()', () => {
    it('should get development as env', () => {
      configDao.get.mockReturnValue('production');
      expect(configDao.getEnv()).toBe('production');
    });
    it('should return empty string when env was not found', () => {
      configDao.get.mockReturnValue(null);
      expect(configDao.getEnv()).toBe('');
    });
  });
});
