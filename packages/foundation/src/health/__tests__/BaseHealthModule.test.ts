/*
 * @Author: Paynter Chen
 * @Date: 2019-07-01 14:07:40
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseHealthModule } from '../BaseHealthModule';
jest.mock('../RegisterItemManager');
describe('BaseHealthModule()', () => {
  describe('register()', () => {
    it('should register by RegisterItemManager', () => {
      const healthModule = new BaseHealthModule(Symbol('test'), 'test');
      const item = {
        name: 'test',
        getStatus: () => 'test status',
      };
      healthModule.register(item);
      expect(healthModule['_manager'].register).toBeCalledWith(item);
    });
  });
  describe('unRegister()', () => {
    it('should unRegister by RegisterItemManager', () => {
      const healthModule = new BaseHealthModule(Symbol('test'), 'test');
      const item = {
        name: 'test',
        getStatus: () => 'test status',
      };
      healthModule.register(item);
      healthModule.unRegister(item);
      expect(healthModule['_manager'].unRegister).toBeCalledWith(item);
    });
  });
  describe('get()', () => {
    it('should get by RegisterItemManager', () => {
      const healthModule = new BaseHealthModule(Symbol('test'), 'test');
      const item = {
        name: 'test',
        getStatus: () => 'test status',
      };
      healthModule.register(item);
      healthModule.get(item.name);
      expect(healthModule['_manager'].get).toBeCalledWith(item.name);
    });
  });
  describe('getAll()', () => {
    it('should get by RegisterItemManager', () => {
      const provider = new BaseHealthModule(Symbol('test'), 'test');
      provider.getAll();
      expect(provider['_manager'].getAll).toBeCalled();
    });
  });
});
