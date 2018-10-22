/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-27 23:40:21
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2018-06-05 14:09:12
 */
/// <reference path="../../__tests__/types.d.ts" />

import KVStorageManager from '../KVStorageManager';
import { KVStorage } from '../adapter/kv';

jest.mock('../adapter/kv/KVStorage');
jest.mock('../adapter/kv/storageFactory');

let kvStorageManager: KVStorageManager;
describe('KVStorageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    kvStorageManager = new KVStorageManager();
  });

  describe('clear()', () => {
    it('should clear the storage', () => {
      kvStorageManager.clear();
      expect(KVStorage.mock.instances[0].clear).toHaveBeenCalled();
    });
  });

  describe('getStorage()', () => {
    it('should return the storage', () => {
      const storage = kvStorageManager.getStorage();
      expect(KVStorage.mock.instances[0]).toBe(storage);
    });
  });
});
