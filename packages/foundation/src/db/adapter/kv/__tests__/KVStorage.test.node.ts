/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-02-27 15:48:18
 * Copyright © RingCentral. All rights reserved.
 */
import KVStorage from '../KVStorage';
import storageFactory from '../storageFactory';

describe('KVStorage', () => {
  const localStorage = storageFactory(window.localStorage);
  let kvStorage: KVStorage;

  beforeAll(() => {
    kvStorage = new KVStorage(localStorage);
    kvStorage.put('a', '1');
  });

  describe('get()', () => {
    it('should return null for the key', () => {
      expect(kvStorage.get('a')).toBe('1');
    });
    it('should do nothing with undefined', () => {
      kvStorage.put('undefined', undefined);
      expect(kvStorage.get('undefined')).toBeNull();
    });
  });

  describe('put()', () => {
    it('should put new item', () => {
      kvStorage.put('b', '123');
      expect(kvStorage.get('b')).toBe('123');
    });
  });

  describe('remove()', () => {
    it('should remove item', () => {
      kvStorage.remove('a');
      expect(kvStorage.get('a')).toBeNull();
    });
  });

  describe('clear()', () => {
    it('should clear all items', () => {
      kvStorage.clear();
      expect(kvStorage.get('a')).toBeNull();
    });
  });

  describe('deserialize()', () => {
    it('should return itself when value can not be parsed', () => {
      expect(kvStorage.deserialize('some string')).toBe('some string');
    });
  });
});

describe('KVStorage when it is not supported', () => {
  const localStorage = storageFactory(null);
  let kvStorage: KVStorage;

  beforeAll(() => {
    kvStorage = new KVStorage(localStorage);
    kvStorage.put('a', '1');
  });

  describe('get()', () => {
    it('should return null for the key', () => {
      expect(kvStorage.get('a')).toBe('1');
    });
    it('should do nothing with undefined', () => {
      kvStorage.put('undefined', undefined);
      expect(kvStorage.get('undefined')).toBeNull();
    });
  });

  describe('put()', () => {
    it('should put new item', () => {
      kvStorage.put('b', '123');
      expect(kvStorage.get('b')).toBe('123');
    });
  });

  describe('remove()', () => {
    it('should remove item', () => {
      kvStorage.remove('a');
      expect(kvStorage.get('a')).toBeNull();
    });
  });

  describe('clear()', () => {
    it('should clear all items', () => {
      kvStorage.clear();
      expect(kvStorage.get('a')).toBeNull();
    });
  });
});
