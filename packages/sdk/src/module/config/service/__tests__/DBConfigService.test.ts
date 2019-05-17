/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-08 19:51:35
 * Copyright © RingCentral. All rights reserved.
 */

import { DBConfigService } from '../DBConfigService';
import notificationCenter from '../../../../service/notificationCenter';
import { CONFIG_EVENT_TYPE } from '../../constants';

jest.mock('../../../../service/notificationCenter');

describe('DBConfigService', () => {
  let configService: DBConfigService;
  const mockConfigDao = {
    get: jest.fn(),
    put: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  } as any;

  beforeEach(() => {
    configService = new DBConfigService();
    configService.setConfigDao(mockConfigDao);
  });

  describe('get', () => {
    it('should call dao', async () => {
      const module = 'test_module';
      const key = 'test_key';
      const value = 'test_value';
      mockConfigDao.get.mockReturnValueOnce(value);
      expect(await configService.get(module, key)).toEqual(value);
      expect(mockConfigDao.get).toBeCalledWith(`${module}.${key}`);
    });
  });

  describe('put', () => {
    it('should call dao and notificationCenter', async () => {
      const module = 'test_module';
      const key = 'test_key';
      const value = 'test_value';
      await configService.put(module, key, value);
      expect(mockConfigDao.put).toBeCalledWith(`${module}.${key}`, value);
      expect(notificationCenter.emit).toBeCalledWith(
        `${module}.${key}`,
        CONFIG_EVENT_TYPE.UPDATE,
        key,
        value,
      );
    });
  });

  describe('remove', () => {
    it('should call dao and notificationCenter', async () => {
      const module = 'test_module';
      const key = 'test_key';
      await configService.remove(module, key);
      expect(mockConfigDao.remove).toBeCalledWith(`${module}.${key}`);
      expect(notificationCenter.emit).toBeCalledWith(
        `${module}.${key}`,
        CONFIG_EVENT_TYPE.REMOVE,
        key,
      );
    });
  });

  describe('clear', () => {
    it('should call dao', async () => {
      await configService.clear();
      expect(mockConfigDao.clear).toBeCalled();
    });
  });

  describe('on', () => {
    it('should call notificationCenter', async () => {
      const module = 'test_module';
      const key = 'test_key';
      const listener = () => {};
      await configService.on(module, key, listener);
      expect(notificationCenter.on).toBeCalledWith(
        `${module}.${key}`,
        listener,
      );
    });
  });

  describe('off', () => {
    it('should call notificationCenter', async () => {
      const module = 'test_module';
      const key = 'test_key';
      const listener = () => {};
      await configService.off(module, key, listener);
      expect(notificationCenter.off).toBeCalledWith(
        `${module}.${key}`,
        listener,
      );
    });
  });
});
