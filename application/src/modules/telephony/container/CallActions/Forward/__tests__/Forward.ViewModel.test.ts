/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-29 09:31:47
 * Copyright © RingCentral. All rights reserved.
 */
import { container, decorate, injectable } from 'framework';
import { TelephonyService } from '../../../../service/TelephonyService';
import { ForwardViewModel } from '../Forward.ViewModel';
import { TELEPHONY_SERVICE } from '../../../../interface/constant';
import { JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { Notification } from '@/containers/Notification';

jest.mock('../../../../service/TelephonyService');
jest.mock('@/containers/Notification');
jest.mock('@/utils/error');

decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);

let vm: ForwardViewModel;

function toastParamsBuilder(message: string) {
  return {
    message,
    type: ToastType.ERROR,
    messageAlign: ToastMessageAlign.LEFT,
    fullWidth: false,
    dismissible: false,
    autoHideDuration: 3000,
  };
}

describe('ForwardViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    vm = new ForwardViewModel();
    vm._telephonyService.getForwardingNumberList = jest.fn();
    vm._telephonyService.forward = jest.fn();
    vm._telephonyService.getForwardPermission = jest.fn();
  });

  describe('get ForwardCalls', () => {
    it('should call getForwardingNumberList in telephony service', async () => {
      await vm.forwardCalls.fetch();
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      expect(_telephonyService.getForwardingNumberList).toHaveBeenCalled();
    });
  });

  describe('get shouldDisableForwardButton', () => {
    it('should call getForwardPermission in telephony service', async () => {
      await vm.shouldDisableForwardButton.fetch();
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      expect(_telephonyService.getForwardPermission).toHaveBeenCalled();
    });
  });

  describe('forward', () => {
    it('should call forward in telephony service', async () => {
      const phoneNumber = '123456789';
      await vm.forward(phoneNumber);
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      expect(_telephonyService.forward).toHaveBeenCalledWith(phoneNumber);
    });

    it('should show ForwardBackendError when server error occurs [JPT-2141]', async () => {
      const phoneNumber = '123456789';
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      _telephonyService.forward = jest
        .fn()
        .mockRejectedValueOnce(
          new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
        );
      await vm.forward(phoneNumber);
      expect(Notification.flashToast).lastCalledWith(
        toastParamsBuilder('telephony.prompt.ForwardBackendError'),
      );
    });
  });
});
