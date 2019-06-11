/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-06 13:19:40
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import { mockService } from 'shield/sdk';
import { ServiceConfig } from 'sdk/module/serviceLoader';

import { CallHistoryViewModel } from '../CallHistory.ViewModel';

describe('CallHistoryViewModel', () => {
  const callLogService = {
    name: ServiceConfig.CALL_LOG_SERVICE,
    clearUnreadMissedCall() {},
  };

  @testable
  class clearUMI {
    @test('should be clear umi if switch tab [JPT-2148]')
    @mockService(callLogService, 'clearUnreadMissedCall')
    t1() {
      const vm = new CallHistoryViewModel();
      vm.clearUMI();
      expect(callLogService.clearUnreadMissedCall).toHaveBeenCalled();
    }
  }
});
