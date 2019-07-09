/*
 * @Author: Paynter Chen
 * @Date: 2019-07-01 14:07:40
 * Copyright © RingCentral. All rights reserved.
 */
import { RegisterItemManager } from '../RegisterItemManager';
describe('RegisterItemManager()', () => {
  describe('register()', () => {
    it('should register successfully', () => {
      const provider = new RegisterItemManager('test');
      provider.register({
        name: 'test',
      });
      expect(provider.getAll().length).toEqual(1);
    });
    it('should register failed when duplicate', () => {
      const provider = new RegisterItemManager('test');
      provider.register({
        name: 'test',
      });
      provider.register({
        name: 'test',
      });
      expect(provider.getAll().length).toEqual(2);
    });
    it('should register failed when duplicate', () => {
      const id = Symbol('test');
      const provider = new RegisterItemManager('test');
      provider.register({
        identify: id,
        name: 'test',
      });
      provider.register({
        identify: id,
        name: 'test',
      });
      expect(provider.getAll().length).toEqual(1);
    });
  });
  describe('unRegister()', () => {
    it('should unRegister by name', () => {
      const provider = new RegisterItemManager('test');
      const testItem = {
        identify: Symbol('test'),
        name: 'test',
      };
      provider.register(testItem);
      provider.unRegister(testItem);
      expect(provider.getAll().length).toEqual(0);
    });
  });
  describe('get()', () => {
    it('should get by identify', () => {
      const provider = new RegisterItemManager('test');
      const testItem = {
        identify: Symbol('test'),
        name: 'test',
      };
      provider.register(testItem);
      expect(provider.get(testItem.identify)).toEqual(testItem);
    });
    it('should get by name', () => {
      const provider = new RegisterItemManager('test');
      const testItem = {
        identify: Symbol('test'),
        name: 'test',
      };
      provider.register(testItem);
      expect(provider.get('test')).toEqual(testItem);
    });
  });
});
