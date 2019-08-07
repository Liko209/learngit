/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-25 13:31:07
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceConfig } from 'sdk/module/serviceLoader';
import { when } from 'mobx';
import { testable, test } from 'shield';
import { mockService } from 'shield/sdk';
import { RCInfoService } from 'sdk/module/rcInfo';
import { Notification } from '@/containers/Notification';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { Caller } from 'sdk/module/RCItems/types';
import { BlockViewModel } from '../Block.ViewModel';

jest.mock('@/containers/Notification');

const networkErrorFunc = () => {
  throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
};

const serverErrorFunc = () => {
  throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
};

const rcInfoService = {
  name: ServiceConfig.RC_INFO_SERVICE,
  addBlockedNumber: jest.fn(),
  deleteBlockedNumbers: jest.fn(),
};

const checkNotification = (message: string) => ({
  message,
  autoHideDuration: 3000,
  dismissible: false,
  fullWidth: false,
  messageAlign: 'left',
  type: 'error',
});

const phoneNumber = '+1234567890';
const caller = { phoneNumber } as Caller;

describe('BlockViewModel', () => {
  @testable
  class isBlocked {
    @test('should isBlocked be undefined when init')
    @mockService(RCInfoService, 'isNumberBlocked', true)
    async t1(done: jest.DoneCallback) {
      const vm = new BlockViewModel({
        phoneNumber,
        caller,
        id: 2031622,
        type: BUTTON_TYPE.MENU_ITEM,
      });
      expect(vm.isBlocked).toBeUndefined();
      await when(
        () => vm.isBlocked !== undefined,
        () => {
          expect(vm.isBlocked).toEqual(true);
          done();
        },
      );
    }
  }

  @testable
  class fetchNumberStatus {
    @test('should isBlocked be true when isNumberBlocked returns true')
    @mockService(RCInfoService, 'isNumberBlocked', true)
    async t1() {
      const vm = new BlockViewModel({
        phoneNumber,
        caller,
        id: 2031622,
        type: BUTTON_TYPE.MENU_ITEM,
      });
      await vm.fetchNumberStatus();
      expect(vm.isBlocked).toEqual(true);
    }

    @test('should isBlocked be false when isNumberBlocked returns false')
    @mockService(RCInfoService, 'isNumberBlocked', false)
    async t2() {
      const vm = new BlockViewModel({
        phoneNumber,
        caller,
        id: 2031622,
        type: BUTTON_TYPE.MENU_ITEM,
      });
      await vm.fetchNumberStatus();
      expect(vm.isBlocked).toEqual(false);
    }
  }

  @testable
  class block {
    @test(
      'should toast error when block number fail for network issue [JPT-2410]',
    )
    @mockService(rcInfoService, [
      {
        method: 'isNumberBlocked',
        data: false,
      },
      {
        method: 'addBlockedNumber',
        data: networkErrorFunc,
      },
    ])
    async t1() {
      const vm = new BlockViewModel({
        phoneNumber,
        caller,
        id: 2031622,
        type: BUTTON_TYPE.ICON,
      });
      await vm.block();
      expect(rcInfoService.addBlockedNumber.mock.calls).toHaveLength(1);
      expect(rcInfoService.addBlockedNumber.mock.calls[0][0]).toEqual(
        phoneNumber,
      );
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('phone.prompt.notAbleToBlockForNetworkIssue'),
      );
    }

    @test(
      'should toast error when block number fail for server issue [JPT-2411]',
    )
    @mockService(rcInfoService, [
      {
        method: 'isNumberBlocked',
        data: false,
      },
      {
        method: 'addBlockedNumber',
        data: serverErrorFunc,
      },
    ])
    async t2() {
      const vm = new BlockViewModel({
        phoneNumber,
        caller,
        id: 2031622,
        type: BUTTON_TYPE.ICON,
      });
      await vm.block();
      expect(rcInfoService.addBlockedNumber.mock.calls).toHaveLength(1);
      expect(rcInfoService.addBlockedNumber.mock.calls[0][0]).toEqual(
        phoneNumber,
      );
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('phone.prompt.notAbleToBlockForServerIssue'),
      );
    }
  }

  @testable
  class unblock {
    @test(
      'should toast error when unblock number fail for network issue [JPT-2412]',
    )
    @mockService(rcInfoService, [
      {
        method: 'isNumberBlocked',
        data: true,
      },
      {
        method: 'deleteBlockedNumbers',
        data: networkErrorFunc,
      },
    ])
    async t1() {
      const vm = new BlockViewModel({
        phoneNumber,
        caller,
        id: 2031622,
        type: BUTTON_TYPE.ICON,
      });
      await vm.unblock();
      expect(rcInfoService.deleteBlockedNumbers.mock.calls).toHaveLength(1);
      expect(rcInfoService.deleteBlockedNumbers.mock.calls[0][0]).toEqual([
        phoneNumber,
      ]);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('phone.prompt.notAbleToUnblockForNetworkIssue'),
      );
    }

    @test(
      'should toast error when unblock number fail for server issue [JPT-2413]',
    )
    @mockService(rcInfoService, [
      {
        method: 'isNumberBlocked',
        data: true,
      },
      {
        method: 'deleteBlockedNumbers',
        data: serverErrorFunc,
      },
    ])
    async t2() {
      const vm = new BlockViewModel({
        phoneNumber,
        caller,
        id: 2031622,
        type: BUTTON_TYPE.ICON,
      });
      await vm.unblock();
      expect(rcInfoService.deleteBlockedNumbers.mock.calls).toHaveLength(1);
      expect(rcInfoService.deleteBlockedNumbers.mock.calls[0][0]).toEqual([
        phoneNumber,
      ]);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('phone.prompt.notAbleToUnblockForServerIssue'),
      );
    }
  }
});
