/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-29 09:31:47
 * Copyright © RingCentral. All rights reserved.
 */
import { container, decorate, injectable, Jupiter } from 'framework';
import { TelephonyService } from '../../../../service/TelephonyService';
import { ForwardViewModel } from '../Forward.ViewModel';
import { TELEPHONY_SERVICE } from '../../../../interface/constant';
import { JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { Notification } from '@/containers/Notification';
import * as common from '@/modules/common/module.config';
import { config } from '@/modules/telephony/module.config';

jest.mock('../../../../service/TelephonyService');
jest.mock('@/containers/Notification');
jest.mock('@/utils/error');

const jupiter = container.get(Jupiter);
jupiter.registerModule(common.config);
jupiter.registerModule(config);

const telephonyService: TelephonyService = container.get(TELEPHONY_SERVICE);

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

const mockForwardList = [
  { phoneNumber: '123456789', label: 'aaa', flipNumber: 222, type: 111 },
];

describe('ForwardViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('constructor()', () => {
    it('should call getForwardingNumberList and getForwardPermission in telephony service', async done => {
      jest
        .spyOn(telephonyService, 'getForwardingNumberList')
        .mockResolvedValue(mockForwardList);

      jest
        .spyOn(telephonyService, 'getForwardPermission')
        .mockResolvedValue(true);
      const vm = new ForwardViewModel();

      setImmediate(() => {
        expect(vm.forwardCalls).toEqual([
          { label: 'aaa', phoneNumber: '123456789' },
        ]);
        expect(vm.shouldDisableForwardButton).toEqual(false);
        done();
      });
    });
  });

  describe('forward', () => {
    it('should call forward in telephony service', async () => {
      const vm = new ForwardViewModel();
      const phoneNumber = '123456789';
      await vm.forward(phoneNumber);
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );

      expect(_telephonyService.forward).toHaveBeenCalledWith(phoneNumber);
    });

    it('should show ForwardBackendError when server error occurs [JPT-2141]', async () => {
      const vm = new ForwardViewModel();
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
