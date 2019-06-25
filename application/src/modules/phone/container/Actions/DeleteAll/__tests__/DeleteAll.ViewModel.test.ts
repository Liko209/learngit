/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-03 14:23:02
 * Copyright © RingCentral. All rights reserved.
 */

import { testable, test } from 'shield';
import { mockService } from 'shield/sdk';
import { Notification } from '@/containers/Notification';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { CallLogService } from 'sdk/module/RCItems/callLog';
import { DeleteAllViewModel } from '../DeleteAll.ViewModel';

jest.mock('@/containers/Notification');

const networkErrorFunc = () => {
  throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
};

const serverErrorFunc = () => {
  throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
};

const checkNotification = (message: string) => ({
  message,
  autoHideDuration: 3000,
  dismissible: false,
  fullWidth: false,
  messageAlign: 'left',
  type: 'error',
});

describe('DeleteAllViewModel', () => {
  @testable
  class clearCallLog {
    @test(
      'should toast error when delete all call log fail for network issue [JPT-2344]',
    )
    @mockService(CallLogService, 'clearAllCallLogs', networkErrorFunc)
    async t1() {
      const vm = new DeleteAllViewModel();
      await vm.clearCallLog();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification(
          'calllog.prompt.notAbleToDeleteAllCallLogForNetworkIssue',
        ),
      );
    }

    @test(
      'should toast error when delete all call log fail for server issue [JPT-2345]',
    )
    @mockService(CallLogService, 'clearAllCallLogs', serverErrorFunc)
    async t2() {
      const vm = new DeleteAllViewModel();
      await vm.clearCallLog();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification(
          'calllog.prompt.notAbleToDeleteAllCallLogForServerIssue',
        ),
      );
    }
  }
});
