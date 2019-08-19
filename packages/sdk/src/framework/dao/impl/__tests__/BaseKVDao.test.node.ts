/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-27 21:51:38
 */
import { KVStorage, storageFactory } from 'foundation/db';
import BaseKVDao from '../BaseKVDao';

const KEY1 = 'key1';
const KEY2 = 'key2';
const NAME = 'mock';
const KEYS = [KEY1, KEY2];

const localStorage = new KVStorage(storageFactory(window.localStorage));
let dao: BaseKVDao;

describe('BaseKVDao', () => {
  beforeEach(() => {
    dao = new BaseKVDao(NAME, localStorage, KEYS);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return null for the key', () => {
    expect(dao.get(KEY1)).toBeNull();
  });

  it('should set new item', () => {
    dao.put(KEY1, '123');
    expect(dao.get(KEY1)).toBe('123');
    dao.put(KEY1, true);
    expect(dao.get(KEY1)).toBe(true);
    dao.put(KEY1, {});
    expect(dao.get(KEY1)).toEqual({});
  });

  it('should remove item for the key', () => {
    dao.put(KEY1, '123');
    expect(dao.get(KEY1)).toBe('123');
    dao.remove(KEY1);
  });
});
