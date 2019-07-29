/*
 * @Author: Paynter Chen
 * @Date: 2019-06-05 13:52:31
 * Copyright © RingCentral. All rights reserved.
 */

import { ElectronCacheItemProvider } from '../ElectronCacheItemProvider';

describe('ElectronCacheItemProvider ', () => {
  describe('getZipItems()', () => {
    it('should getZipItems when Electron inject get method to jupiterElectron', async () => {
      window.jupiterElectron = {
        getIndexedDBZip: jest.fn().mockResolvedValue('a'),
        getLocalStorageZip: jest.fn().mockResolvedValue('b'),
      };
      const provider = new ElectronCacheItemProvider();
      const result = await provider.getZipItems();
      expect(result).toEqual([
        {
          type: '.zip',
          folder: 'ElectronCache',
          name: 'indexedDB',
          content: 'a',
        },
        {
          type: '.zip',
          folder: 'ElectronCache',
          name: 'localStorage',
          content: 'b',
        },
      ]);
    });
    it('should getZipItems empty when not method inject to jupiterElectron', async () => {
      window.jupiterElectron = {};
      const provider = new ElectronCacheItemProvider();
      const result = await provider.getZipItems();
      expect(result).toEqual([]);
    });
  });
});
