/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 11:04:54
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { daoManager, AccountDao } from '../../../../dao';
import { RecentSearchRecordController } from '../RecentSearchRecordController';

jest.mock('../../../../dao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RecentSearchRecordController', () => {
  const db: any = {};
  let accountDao: AccountDao;
  let controller: RecentSearchRecordController;
  let threeRecords = [buildRecord(1), buildRecord(2), buildRecord(3)];

  function setUp() {
    accountDao = new AccountDao(db);
    daoManager.getKVDao = jest.fn().mockReturnValue(accountDao);
    controller = new RecentSearchRecordController();
    threeRecords = [buildRecord(1), buildRecord(2), buildRecord(3)];
  }

  function buildRecord(id: number) {
    return {
      id,
      type: '',
      value: `${id}`,
      query_params: {},
      time_stamp: Date.now(),
    };
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('addRecentSearchRecord', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should has at most 10 records', () => {
      const records = [];
      for (let i = 0; i < 10; i++) {
        records.push(buildRecord(i));
      }

      accountDao.get = jest.fn().mockReturnValue(records);
      let newRecords = _.cloneDeep(records);
      const newRecord: any = buildRecord(100);
      newRecords.pop();
      newRecords = [newRecord].concat(newRecords);

      controller.addRecentSearchRecord(
        newRecord.type,
        newRecord.value,
        newRecord.query_params,
      );

      expect(accountDao.put).toBeCalledWith(
        'recent_search_records',
        newRecords.map((x: any) => {
          return {
            id: expect.anything(),
            type: x.type,
            value: x.value,
            query_params: x.query_params,
            time_stamp: expect.anything(),
          };
        }),
      );
    });

    it('new record should be at first place', () => {
      accountDao.get = jest.fn().mockReturnValue(threeRecords);
      const newRecord: any = buildRecord(4);
      controller.addRecentSearchRecord(
        newRecord.type,
        newRecord.value,
        newRecord.query_params,
      );
      const expectRecords = [newRecord].concat(threeRecords);
      expect(accountDao.put).toBeCalledWith(
        'recent_search_records',
        expectRecords.map((x: any) => {
          return {
            id: expect.anything(),
            type: x.type,
            value: x.value,
            query_params: x.query_params,
            time_stamp: expect.anything(),
          };
        }),
      );
    });

    it('new record should be replace old records and put at first place', () => {
      accountDao.get = jest.fn().mockReturnValue(threeRecords);
      const newRecord: any = buildRecord(2);
      controller.addRecentSearchRecord(
        newRecord.type,
        newRecord.value,
        newRecord.query_params,
      );
      const expectedRes = [buildRecord(2), buildRecord(1), buildRecord(3)];
      expect(accountDao.put).toBeCalledWith(
        'recent_search_records',
        expectedRes.map((x: any) => {
          return {
            id: expect.anything(),
            type: x.type,
            value: x.value,
            query_params: x.query_params,
            time_stamp: expect.anything(),
          };
        }),
      );
    });
  });

  describe('clearRecentSearchRecords', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should clear all records', () => {
      accountDao.get = jest.fn().mockReturnValue(threeRecords);
      controller.clearRecentSearchRecords();
      expect(accountDao.put).toBeCalledWith('recent_search_records', []);
    });
  });

  describe('getRecentSearchRecords', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return all records', () => {
      accountDao.get = jest.fn().mockReturnValue(threeRecords);
      const newRecords = controller.getRecentSearchRecords();
      expect(accountDao.get).toBeCalledWith('recent_search_records');
      expect(newRecords).toEqual(threeRecords);
    });
  });

  describe('removeRecentSearchRecords', () => {
    it('should remove record in the input id set', () => {
      const ids = [1, 3];
      const idSet = new Set(ids);
      accountDao.get = jest.fn().mockReturnValue(threeRecords);
      controller.removeRecentSearchRecords(idSet);
      const res = buildRecord(2);
      expect(accountDao.put).toBeCalledWith('recent_search_records', [
        {
          id: 2,
          time_stamp: expect.anything(),
          type: res.type,
          value: res.value,
          query_params: res.query_params,
        },
      ]);
    });
  });
});
