/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-28 16:23:23
 * Copyright © RingCentral. All rights reserved.
 */

import { RCItemFetchController } from '../RCItemFetchController';
import { CALL_LOG_SOURCE } from 'sdk/module/RCItems/callLog/constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

class TestFetchController extends RCItemFetchController<any> {
  isTokenInvalidError = jest.fn();
  canUpdateSyncToken = jest.fn();
  requestClearAllAndRemoveLocalData = jest.fn();
  removeLocalData = jest.fn();
  handleDataAndNotify = jest.fn();
  sendSyncRequest = jest.fn();
  doSync = jest.fn();
  handleDataAndSave = jest.fn();
  getFilterInfo = jest.fn();
  fetchDataFromDB = jest.fn();
  onFetchFinished = jest.fn();
  onDBFetchFinished = jest.fn();
}

const clearAll = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
};

describe('RCItemFetchController', () => {
  let controller: TestFetchController;
  const mockUserConfig = {
    getHasMore: jest.fn(),
  } as any;
  const mockSearchService = {
    doFuzzySearchPhoneContacts: jest.fn(),
  } as any;

  const setup = () => {
    ServiceLoader.getInstance = jest.fn().mockImplementation((data: string) => {
      if (data === ServiceConfig.SEARCH_SERVICE) {
        return mockSearchService;
      }
    });
    controller = new TestFetchController(
      'testName',
      mockUserConfig,
      'eventKey',
      123,
    );
  };

  beforeEach(() => {
    clearAll();
    setup();
  });

  describe('buildFilterFunc, JPT-2453, JPT-2472, JPT-2473', () => {
    const mockAllData = [
      { phoneNumber: '6502345678' },
      { phoneNumber: '6502345679' },
      { phoneNumber: '6502345671' },
      { phoneNumber: '6502345672' },
      { name: 'Jupiter  Engineer', phoneNumber: '678' },
      { name: 'GlipSomeOne' },
      { phoneNumber: '4949494949' },
    ];
    const mockKey = [
      'Jupiter',
      'Jupiter 678',
      '678',
      'Jupiter  Engineer',
      '6502345678',
      'SomeOne',
      '49',
    ];
    const mockMatchedContacts = [
      {
        phoneContacts: [
          { phoneNumber: { id: '6502345678' } },
          { phoneNumber: { id: '6502345679' } },
          { phoneNumber: { id: '6502345671' } },
          { phoneNumber: { id: '6502345672' } },
          { phoneNumber: { id: '678' } },
        ],
      },
      {
        phoneContacts: [
          { phoneNumber: { id: '6502345678' } },
          { phoneNumber: { id: '6502345671' } },
          { phoneNumber: { id: '6502345672' } },
          { phoneNumber: { id: '678' } },
        ],
      },
      {
        phoneContacts: [
          { phoneNumber: { id: '6502345678' } },
          { phoneNumber: { id: '6502345671' } },
          { phoneNumber: { id: '6502345672' } },
          { phoneNumber: { id: '678' } },
        ],
      },
      { phoneContacts: [{ phoneNumber: { id: '678' } }] },
      { phoneContacts: [{ phoneNumber: { id: '6502345678' } }] },
      { phoneContacts: [] },
      { phoneContacts: [] },
    ];
    const mockResult = [
      [
        { phoneNumber: '6502345678' },
        { phoneNumber: '6502345679' },
        { phoneNumber: '6502345671' },
        { phoneNumber: '6502345672' },
        { name: 'Jupiter  Engineer', phoneNumber: '678' },
      ],
      [
        { phoneNumber: '6502345678' },
        { phoneNumber: '6502345671' },
        { phoneNumber: '6502345672' },
        { name: 'Jupiter  Engineer', phoneNumber: '678' },
      ],
      [
        { phoneNumber: '6502345678' },
        { phoneNumber: '6502345671' },
        { phoneNumber: '6502345672' },
        { name: 'Jupiter  Engineer', phoneNumber: '678' },
      ],
      [{ name: 'Jupiter  Engineer', phoneNumber: '678' }],
      [{ phoneNumber: '6502345678' }],
      [{ name: 'GlipSomeOne' }],
      [{ phoneNumber: '4949494949' }],
    ];
    it.each`
      key           | matchedContacts           | result
      ${mockKey[0]} | ${mockMatchedContacts[0]} | ${mockResult[0]}
      ${mockKey[1]} | ${mockMatchedContacts[1]} | ${mockResult[1]}
      ${mockKey[2]} | ${mockMatchedContacts[2]} | ${mockResult[2]}
      ${mockKey[3]} | ${mockMatchedContacts[3]} | ${mockResult[3]}
      ${mockKey[4]} | ${mockMatchedContacts[4]} | ${mockResult[4]}
    `(
      'should get correct filter func',
      async ({ key, matchedContacts, result }) => {
        mockSearchService.doFuzzySearchPhoneContacts.mockResolvedValue(
          matchedContacts,
        );
        controller.getFilterInfo = jest.fn().mockImplementation(data => {
          return data;
        });
        const filterFunc = await controller.buildFilterFunc({ filterKey: key });
        expect(mockAllData.filter(filterFunc)).toEqual(result);
      },
    );
  });

  describe('fetchData', () => {
    it('should get data from DB and not trigger request when filter is valid, JPT-2442, JPT-2451', async () => {
      const mockData = { id: 'test' };
      controller.fetchDataFromDB = jest.fn().mockReturnValue([mockData]);
      controller.onDBFetchFinished = jest.fn();

      expect(
        await controller.fetchData({
          callLogSource: CALL_LOG_SOURCE.ALL,
          limit: 30,
          filterFunc: () => {
            return true;
          },
        }),
      ).toEqual({
        data: [mockData],
        hasMore: false,
      });
      expect(controller.fetchDataFromDB).toBeCalled();
      expect(controller.onDBFetchFinished).toBeCalled();
      expect(mockUserConfig.getHasMore).not.toBeCalled();
      expect(controller.doSync).not.toBeCalled();
      expect(controller.onFetchFinished).toBeCalled();
    });

    it('should get data from DB and not trigger request when limit < localDataSize', async () => {
      const mockData = { id: 'test' };
      controller.fetchDataFromDB = jest.fn().mockReturnValue([mockData]);
      controller.onDBFetchFinished = jest.fn();

      expect(
        await controller.fetchData({
          callLogSource: CALL_LOG_SOURCE.ALL,
          limit: 1,
        }),
      ).toEqual({
        data: [mockData],
        hasMore: true,
      });
      expect(controller.fetchDataFromDB).toBeCalled();
      expect(controller.onDBFetchFinished).toBeCalled();
      expect(mockUserConfig.getHasMore).not.toBeCalled();
      expect(controller.doSync).not.toBeCalled();
      expect(controller.onFetchFinished).toBeCalled();
    });

    it('should not trigger request when hasMore is false', async () => {
      const mockData = { id: 'test' };
      controller.fetchDataFromDB = jest.fn().mockReturnValue([mockData]);
      controller.onDBFetchFinished = jest.fn();
      mockUserConfig.getHasMore.mockResolvedValue(false);

      expect(
        await controller.fetchData({
          callLogSource: CALL_LOG_SOURCE.ALL,
          limit: 30,
        }),
      ).toEqual({
        data: [mockData],
        hasMore: false,
      });
      expect(controller.fetchDataFromDB).toBeCalled();
      expect(controller.onDBFetchFinished).toBeCalled();
      expect(mockUserConfig.getHasMore).toBeCalled();
      expect(controller.doSync).not.toBeCalled();
      expect(controller.onFetchFinished).toBeCalled();
    });

    it('should trigger request when hasMore is true', async () => {
      const mockData = { id: 'test' };
      const mockServerData = { id: 'server' };
      controller.fetchDataFromDB = jest.fn().mockReturnValue([mockData]);
      controller.onDBFetchFinished = jest.fn();
      mockUserConfig.getHasMore.mockResolvedValue(true);
      controller.doSync.mockResolvedValue([mockServerData]);

      expect(
        await controller.fetchData({
          callLogSource: CALL_LOG_SOURCE.ALL,
          limit: 30,
        }),
      ).toEqual({
        data: [mockData, mockServerData],
        hasMore: true,
      });
      expect(controller.fetchDataFromDB).toBeCalled();
      expect(controller.onDBFetchFinished).toBeCalled();
      expect(mockUserConfig.getHasMore).toBeCalled();
      expect(controller.doSync).toBeCalled();
      expect(controller.onFetchFinished).toBeCalled();
    });

    it('should throw error when local data is empty and request crashed', async () => {
      const mockError = { id: 'test' };
      controller.fetchDataFromDB = jest.fn().mockReturnValue([]);
      controller.onDBFetchFinished = jest.fn();
      mockUserConfig.getHasMore.mockResolvedValue(true);
      controller.doSync.mockImplementation(() => {
        throw mockError;
      });

      await controller
        .fetchData({
          callLogSource: CALL_LOG_SOURCE.ALL,
          limit: 30,
        })
        .catch(reason => {
          expect(reason).toEqual(mockError);
        });
      expect(controller.fetchDataFromDB).toBeCalled();
      expect(controller.onDBFetchFinished).toBeCalled();
      expect(mockUserConfig.getHasMore).toBeCalled();
      expect(controller.doSync).toBeCalled();
      expect(controller.onFetchFinished).not.toBeCalled();
    });
  });
});
