/*
 * @Author: Rito Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-09-02 15:33:55
 * Copyright © RingCentral. All rights reserved.
 */

import DBKVDao from '../DBKVDao';

describe('DBKVDao', () => {
  let dao: DBKVDao;
  const mockCollection = {
    put: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  } as any;
  const mockDB = {
    getCollection: () => {
      return mockCollection;
    },
    ensureDBOpened: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    dao = new DBKVDao(mockDB);
  });

  describe('put', () => {
    it('should put to db and cache', async () => {
      await dao.put('key', 'value');
      expect(mockDB.ensureDBOpened).toHaveBeenCalled();
      expect(mockCollection.put).toHaveBeenCalledWith({
        key: 'key',
        value: 'value',
      });
      expect(dao['_KVMap'].get('key')).toEqual('value');
    });
  });

  describe('get', () => {
    it('should get from cache first', async () => {
      dao['_KVMap'].set('key', 'value');
      await dao.get('key');
      expect(mockDB.ensureDBOpened).not.toHaveBeenCalled();
      expect(dao['_KVMap'].get('key')).toEqual('value');
    });

    it('should get from db when can not find in cache', async () => {
      mockCollection.get.mockReturnValue({ value: 'value' });

      await dao.get('key');
      expect(mockDB.ensureDBOpened).toHaveBeenCalled();
      expect(mockCollection.get).toHaveBeenCalledWith('key');
      expect(dao['_KVMap'].get('key')).toEqual('value');
    });
  });
});
