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
import { DeleteViewAllModel } from '../DeleteAll.ViewModel';
import { BUTTON_TYPE } from '../types';

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

describe('DeleteViewModel', () => {
  @testable
  class deleteCallLog {
    @test('should toast error when delete call log fail for network issue')
    @mockService(CallLogService, 'deleteCallLogs', networkErrorFunc)
    async t1() {
      const vm = new DeleteViewAllModel({
        id: 2031622,
        type: BUTTON_TYPE.MENU_ITEM,
      });
      await vm.deleteCallLog();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification(
          'calllog.prompt.notAbleToDeleteCallLogForNetworkIssue',
        ),
      );
    }

    @test('should toast error when delete call log fail for server issue')
    @mockService(CallLogService, 'deleteCallLogs', serverErrorFunc)
    async t2() {
      const vm = new DeleteViewAllModel({
        id: 2031622,
        type: BUTTON_TYPE.MENU_ITEM,
      });
      await vm.deleteCallLog();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification(
          'calllog.prompt.notAbleToDeleteCallLogForServerIssue',
        ),
      );
    }
  }
});
