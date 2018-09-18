/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:02:23
 * Copyright © RingCentral. All rights reserved.
 */
import GlobalStore from '../GlobalStore';

describe('GlobalStore', () => {
  const globalStore = new GlobalStore();
  beforeAll(() => {
    globalStore.clear();
  });
  describe('set(key, value)', () => {
    it('the key should be set with value in globalStore', () => {
      const key = {};
      const value = {};
      globalStore.set(key, value);
      expect(globalStore.get(key)).toEqual(value);
    });
  });
  describe('batchSet(data)', () => {
    it('should batch set with data', () => {
      const key1 = {};
      const value1 = {};
      const key2 = {};
      const value2 = {};
      const data = new Map();
      data.set(key1, value1);
      data.set(key2, value2);
      globalStore.batchSet(data);
      expect(globalStore.get(key1)).toEqual(value1);
      expect(globalStore.get(key2)).toEqual(value2);
    });
  });
  describe('remove(key)', () => {
    it('should remove the key in globalStore', () => {
      const key = {};
      const value = {};
      globalStore.set(key, value);
      expect(globalStore.get(key)).toEqual(value);
      globalStore.remove(key);
      expect(globalStore.get(key)).toBeUndefined();
    });
  });
  describe('batchRemove(keys)', () => {
    it('should remove the key in globalStore', () => {
      const key1 = {};
      const value1 = {};
      const key2 = {};
      const value2 = {};
      const data = new Map();
      data.set(key1, value1);
      data.set(key2, value2);
      globalStore.batchSet(data);
      expect(globalStore.get(key1)).toEqual(value1);
      expect(globalStore.get(key2)).toEqual(value2);
      globalStore.batchRemove([key1, key2]);
      expect(globalStore.get(key1)).toBeUndefined();
      expect(globalStore.get(key2)).toBeUndefined();
    });
  });
});
