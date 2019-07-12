/*
 * @Author: isaac.liu
 * @Date: 2019-07-08 15:13:15
 * Copyright © RingCentral. All rights reserved.
 */
import { CallLogType } from '..';
import { testable, test } from 'shield';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { mockService } from 'shield/sdk';
import { mockEntity, mockSingleEntity } from 'shield/application';
import { ENTITY } from 'sdk/service/eventKey';
import { AllCallsViewModel } from '../AllCalls.ViewModel';
import { QUERY_DIRECTION } from 'sdk/dao';

describe('AllCalls Test', () => {
  const data = [
    {
      id: 'IVsTZukAjaFbzUA',
      __timestamp: 1562642092034,
    },
    {
      id: 'IVsHHjQVIanXzUA',
      __timestamp: 1562563649015,
    },
    {
      id: 'IVsTYr8wJIi9zUA',
      __timestamp: 1562642025548,
    },
    {
      id: 'IVsTaExGBf7lzUA',
      __timestamp: 1562642098363,
    },
  ];
  const expected = data
    .slice(0)
    .sort((a, b) => b.__timestamp - a.__timestamp)
    .map(({ id }) => id);

  const calllogService = {
    name: ServiceConfig.CALL_LOG_SERVICE,
    fetchCallLogs() {},
  };

  const rcInfoService = {
    name: ServiceConfig.RC_INFO_SERVICE,
    isRCFeaturePermissionEnabled: () => true,
  };

  const profileService = {
    name: ServiceConfig.PROFILE_SERVICE,
  };

  const entity = (name: string, id: any) => {
    if (name === ENTITY.CALL_LOG) {
      return data.find(v => v.id === id);
    }
    return {};
  };

  @testable
  class JPT2282 {
    @test('should show item in reverse order when loaded data JPT-2282')
    @mockService(calllogService, [
      {
        method: 'fetchCallLogs',
        data: () => ({ data, hasMore: true }),
      },
      {
        method: 'buildFilterFunc',
        data: async () => (callLog: any) => {
          return true;
        },
      },
    ])
    @mockService(rcInfoService, [
      {
        method: 'isRCFeaturePermissionEnabled', // will mockResolveValue
        data: () => true,
      },
      {
        method: 'isVoipCallingAvailable',
        data: () => true,
      },
    ])
    @mockService(profileService, 'getProfile', {})
    @mockEntity(entity)
    @mockSingleEntity({})
    async t1() {
      // test for missed call
      const vm = new AllCallsViewModel({
        type: CallLogType.MissedCall,
        height: 800,
        filterValue: 'v',
        width: 1000,
      });

      // test for all types
      const vm2 = new AllCallsViewModel({
        type: CallLogType.All,
        height: 800,
        filterValue: 'v',
        width: 1000,
      });

      const handler = vm2.getHandler();
      await handler.fetchSortableDataListHandler.fetchData(
        QUERY_DIRECTION.NEWER,
        20,
      );

      // @ts-ignore
      vm2._setFilterFOCKey('v');
      // @ts-ignore
      vm2._setHandler(handler);

      await new Promise(resolve => setTimeout(resolve));
      expect(vm.listHandler.sortableListStore.getIds).toEqual(expected);
      expect(vm2.listHandler.sortableListStore.getIds).toEqual(expected);
    }
  }
});
