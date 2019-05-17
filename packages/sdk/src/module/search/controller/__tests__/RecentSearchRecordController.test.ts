/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 11:04:54
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';

import { RecentSearchRecordController } from '../RecentSearchRecordController';
import { SearchUserConfig } from '../../config/SearchUserConfig';
import { RecentSearchTypes } from '../../entity';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('../../config/SearchUserConfig', () => {
  const xx = {
    setRecentSearchRecords: jest.fn(),
    getRecentSearchRecords: jest.fn(),
  };
  return {
    SearchUserConfig: () => {
      return xx;
    },
  };
});

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RecentSearchRecordController', () => {
  let controller: RecentSearchRecordController;
  let threeRecords = [buildRecord(1), buildRecord(2), buildRecord(3)];
  let searchUserConfig: SearchUserConfig;
  function setUp() {
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.SEARCH_SERVICE) {
          return { userConfig: searchUserConfig };
        }
      });
    searchUserConfig = new SearchUserConfig();
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

      searchUserConfig.getRecentSearchRecords = jest
        .fn()
        .mockReturnValue(records);
      let newRecords = _.cloneDeep(records);
      const newRecord: any = buildRecord(100);
      newRecords.pop();
      newRecords = [newRecord].concat(newRecords);

      controller.addRecentSearchRecord(
        newRecord.type,
        newRecord.value,
        newRecord.query_params,
      );
      expect(searchUserConfig.setRecentSearchRecords).toBeCalledWith(
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
      searchUserConfig.getRecentSearchRecords = jest
        .fn()
        .mockReturnValue(threeRecords);
      const newRecord: any = buildRecord(4);
      controller.addRecentSearchRecord(
        newRecord.type,
        newRecord.value,
        newRecord.query_params,
      );
      const expectRecords = [newRecord].concat(threeRecords);
      expect(searchUserConfig.setRecentSearchRecords).toBeCalledWith(
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

    it('new record should replace old records and put at first place', () => {
      searchUserConfig.getRecentSearchRecords = jest
        .fn()
        .mockReturnValue(threeRecords);
      const newRecord: any = buildRecord(2);
      controller.addRecentSearchRecord(
        newRecord.type,
        newRecord.value,
        newRecord.query_params,
      );
      const expectedRes = [buildRecord(2), buildRecord(1), buildRecord(3)];
      expect(searchUserConfig.setRecentSearchRecords).toBeCalledWith(
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

    it('new record should not replace old records when params is no same', () => {
      searchUserConfig.getRecentSearchRecords = jest
        .fn()
        .mockReturnValue(threeRecords);
      const newRecord: any = buildRecord(2);
      newRecord.query_params = { groupId: 11 };
      controller.addRecentSearchRecord(newRecord.type, newRecord.value, {
        groupId: 11,
      });
      const expectedRes = [
        newRecord,
        buildRecord(1),
        buildRecord(2),
        buildRecord(3),
      ];
      expect(searchUserConfig.setRecentSearchRecords).toBeCalledWith(
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
      searchUserConfig.getRecentSearchRecords = jest
        .fn()
        .mockReturnValue(threeRecords);
      controller.clearRecentSearchRecords();
      expect(searchUserConfig.setRecentSearchRecords).toBeCalledWith([]);
    });
  });

  describe('getRecentSearchRecords', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return all records', () => {
      searchUserConfig.getRecentSearchRecords = jest
        .fn()
        .mockReturnValue(threeRecords);
      const newRecords = controller.getRecentSearchRecords();
      expect(searchUserConfig.getRecentSearchRecords).toBeCalled();
      expect(newRecords).toEqual(threeRecords);
    });
  });

  describe('removeRecentSearchRecords', () => {
    it('should remove record in the input id set', () => {
      const ids = [1, 3];
      const idSet = new Set(ids);
      searchUserConfig.getRecentSearchRecords = jest
        .fn()
        .mockReturnValue(threeRecords);
      controller.removeRecentSearchRecords(idSet);
      const res = buildRecord(2);
      expect(searchUserConfig.setRecentSearchRecords).toBeCalledWith([
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

  describe('getRecentSearchRecordsByType', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    const records = [
      { id: 1, time_stamp: 1, type: 'people', value: 111 },
      { id: 2, time_stamp: 2, type: 'team', value: 222 },
      { id: 3, time_stamp: 3, type: 'group', value: 333 },
      { id: 4, time_stamp: 4, type: 'search', value: '444' },
    ];
    it('should return expected records map', () => {
      searchUserConfig.getRecentSearchRecords = jest
        .fn()
        .mockReturnValue(records);
      expect(
        controller.getRecentSearchRecordsByType(RecentSearchTypes.PEOPLE),
      ).toEqual(
        new Map([[111, { id: 1, time_stamp: 1, type: 'people', value: 111 }]]),
      );

      expect(
        controller.getRecentSearchRecordsByType(RecentSearchTypes.TEAM),
      ).toEqual(
        new Map([[222, { id: 2, time_stamp: 2, type: 'team', value: 222 }]]),
      );

      expect(
        controller.getRecentSearchRecordsByType(RecentSearchTypes.GROUP),
      ).toEqual(
        new Map([[333, { id: 3, time_stamp: 3, type: 'group', value: 333 }]]),
      );

      expect(
        controller.getRecentSearchRecordsByType(RecentSearchTypes.SEARCH),
      ).toEqual(
        new Map([
          ['444', { id: 4, time_stamp: 4, type: 'search', value: '444' }],
        ]),
      );
    });
  });
});
