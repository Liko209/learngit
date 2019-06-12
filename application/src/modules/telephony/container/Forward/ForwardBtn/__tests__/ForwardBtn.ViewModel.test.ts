/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-03 18:03:24
 * Copyright © RingCentral. All rights reserved.
 */
import { ForwardBtnViewModel } from '../ForwardBtn.ViewModel';
import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../../store';
import { TelephonyService } from '../../../../service/TelephonyService';
import { TELEPHONY_SERVICE } from '../../../../interface/constant';
import { Notification } from '@/containers/Notification';
import { JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { ToastCallError } from '../../../../service/ToastCallError';

jest.mock('../../../../service/TelephonyService');
jest.mock('@/containers/Notification');
jest.mock('../../../../service/ToastCallError');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let vm: ForwardBtnViewModel;

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

describe('ForwardBtnViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ForwardBtnViewModel();
    vm._telephonyService.forward = jest.fn();
    vm._telephonyService.isValidNumber = jest
      .fn()
      .mockReturnValue({ isValid: true });
  });
  it('should call forward function', async () => {
    vm._telephonyStore.forwardString = '123';
    await vm.forward();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.forward).toHaveBeenCalled();
  });

  it('should call invalid forward number should prompt toast [JPT-2140]', async () => {
    vm._telephonyStore.forwardString = 'aac';
    vm._telephonyService.isValidNumber = jest
      .fn()
      .mockReturnValue({ isValid: false });
    await vm.forward();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.forward).not.toHaveBeenCalled();
    expect(ToastCallError.toastInvalidNumber).toHaveBeenCalled();
  });

  it('Should prompt flash toast when run into unexpected backend error [JPT-2141]', async () => {
    vm._telephonyService.forward = jest
      .fn()
      .mockRejectedValueOnce(
        new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
      );
    vm._telephonyStore.forwardString = '123';
    await vm.forward();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(Notification.flashToast).toHaveBeenCalledWith(
      toastParamsBuilder('telephony.prompt.ForwardBackendError'),
    );
  });
});
