/*
 * @Author: Paynter Chen
 * @Date: 2019-07-01 14:07:40
 * Copyright © RingCentral. All rights reserved.
 */
import { HealthModuleManager } from '../HealthModuleManager';
import { IHealthModule } from '../types';
import { BaseHealthModule } from '../BaseHealthModule';
jest.mock('../RegisterItemManager');
describe('HealthModuleManager()', () => {
  let item: IHealthModule;
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
    item = new BaseHealthModule(Symbol('test'), 'test');
  });
  describe('register()', () => {
    it('should register by RegisterItemManager', () => {
      const healthModule = HealthModuleManager.getInstance();
      healthModule.register(item);
      expect(healthModule['_manager'].register).toBeCalledWith(item);
    });
  });
  describe('unRegister()', () => {
    it('should unRegister by RegisterItemManager', () => {
      const healthModule = HealthModuleManager.getInstance();
      healthModule.register(item);
      healthModule.unRegister(item);
      expect(healthModule['_manager'].unRegister).toBeCalledWith(item);
    });
  });
  describe('get()', () => {
    it('should get by RegisterItemManager', () => {
      const healthModule = HealthModuleManager.getInstance();
      healthModule.register(item);
      healthModule.get(item.name);
      expect(healthModule['_manager'].get).toBeCalledWith(item.name);
    });
  });
  describe('getAll()', () => {
    it('should get by RegisterItemManager', () => {
      const provider = HealthModuleManager.getInstance();
      provider.getAll();
      expect(provider['_manager'].getAll).toBeCalled();
    });
  });
});
