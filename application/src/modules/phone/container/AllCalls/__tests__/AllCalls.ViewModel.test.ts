/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-09 20:00:42
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockService } from 'shield/sdk';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { QUERY_DIRECTION } from 'sdk/dao';
import { CALL_LOG_SOURCE } from 'sdk/module/RCItems/callLog/constants';
import { AllCallsViewModel } from '../AllCalls.ViewModel';
import { CallLogType } from '../types';

describe('VoicemailDataProvider', () => {
  const calllogService = {
    name: ServiceConfig.CALL_LOG_SERVICE,
    fetchCallLogs() {},
  };

  @testable
  class fetchData {
    @test(
      'should be call fetchVoicemails not anchor when use fetchData [JPT-2145]',
    )
    @mockService(calllogService, 'fetchCallLogs', true)
    @mockService.resolve(calllogService, 'buildFilterFunc', {})
    async t1() {
      const vm = new AllCallsViewModel({ type: CallLogType.All, height: 800 });
      const ret = await vm._fetchData(QUERY_DIRECTION.OLDER, 1);
      expect(calllogService.fetchCallLogs).toHaveBeenCalledWith({
        callLogSource: CALL_LOG_SOURCE.ALL,
        limit: 1,
        direction: QUERY_DIRECTION.NEWER,
      });
      expect(ret).toBeTruthy();
    }

    @test(
      'should be call fetchVoicemails with anchor when use fetchData [JPT-2145]',
    )
    @mockService(calllogService, 'fetchCallLogs', true)
    @mockService.resolve(calllogService, 'buildFilterFunc', {})
    async t2() {
      const vm = new AllCallsViewModel({
        type: CallLogType.MissedCall,
        height: 800,
      });
      const ret = await vm._fetchData(QUERY_DIRECTION.NEWER, 1, {
        id: '1',
        sortValue: 1,
      });
      expect(calllogService.fetchCallLogs).toHaveBeenCalledWith({
        callLogSource: CALL_LOG_SOURCE.MISSED,
        limit: 1,
        anchorId: '1',
        direction: QUERY_DIRECTION.OLDER,
      });
      expect(ret).toBeTruthy();
    }

    @test('should show error page when fetch data error [JPT-2361] [JPT-2370]')
    @mockService.reject(calllogService, 'fetchCallLogs', 'error')
    @mockService.resolve(calllogService, 'buildFilterFunc', {})
    async t3() {
      const vm = new AllCallsViewModel();
      expect(vm.isError).toBeFalsy();
      await vm._fetchData(QUERY_DIRECTION.OLDER, 1, {
        id: '1',
        sortValue: 1,
      });
      expect(vm.isError).toBeTruthy();
    }
  }
});
