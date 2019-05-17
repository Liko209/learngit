/*
 * @Author: Paynter Chen
 * @Date: 2019-05-16 23:07:04
 * Copyright © RingCentral. All rights reserved.
 */

import { HealthStatusItemProvider } from '../HealthStatusItemProvider';

describe('HealthStatusItemProvider', () => {
  describe('registerHealthStatusItem()', () => {
    it('should register successfully', () => {
      const provider = new HealthStatusItemProvider();
      provider.registerHealthStatusItem({
        getName: () => 'test',
        getStatus: async () => 'status',
      });
      expect(provider['_items'].length).toEqual(1);
    });
  });
  describe('unRegisterHealthStatusItem()', () => {
    it('should unRegister by name', () => {
      const provider = new HealthStatusItemProvider();
      const testItem = {
        getName: () => 'test',
        getStatus: async () => 'status',
      };
      provider.registerHealthStatusItem(testItem);
      provider.unRegisterHealthStatusItem('test');
      expect(provider['_items'].length).toEqual(0);
    });
    it('should unRegister by item instance', () => {
      const provider = new HealthStatusItemProvider();
      const testItem = {
        getName: () => 'test',
        getStatus: async () => 'status',
      };
      provider.registerHealthStatusItem(testItem);
      provider.unRegisterHealthStatusItem(testItem);
      expect(provider['_items'].length).toEqual(0);
    });
  });
  describe('getZipItems()', () => {
    it('should getZipItems', async () => {
      const provider = new HealthStatusItemProvider();
      provider.registerHealthStatusItem({
        getName: () => 'test',
        getStatus: async () => 'status',
      });
      const result = await provider.getZipItems();
      expect(result.length).toEqual(1);
      expect(result[0].type).toEqual('.txt');
      expect(result[0].name).toEqual('HealthStatus');
    });
  });
});
