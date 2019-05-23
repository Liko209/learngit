/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-11 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { ExtensionsViewModel } from '../Extensions.ViewModel';
import { errorHelper, JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import { RCInfoService } from 'sdk/module/rcInfo';
import { Notification } from '@/containers/Notification';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/module/rcInfo', () => ({
  RCInfoService: jest.fn(),
}));
jest.mock('@/containers/Notification');
const rCInfoService = new RCInfoService();

function getNewJServerError(code: string, message: string = '') {
  return new JServerError(code, message);
}

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

describe('ExtensionsViewModel', () => {
  beforeEach(() => {
    ServiceLoader.getInstance = jest.fn().mockReturnValue(rCInfoService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('generateWebSettingUri()', () => {
    it('should Display error when failed to receive user information before opening Extension Settings page. [JPT-1781]', async () => {
      rCInfoService.generateWebSettingUri = jest
        .fn()
        .mockRejectedValueOnce(
          getNewJServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED),
        );
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValueOnce(true);
      Notification.flashToast = jest.fn();
      const model = new ExtensionsViewModel();
      await model.generateWebSettingUri();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('setting.phone.general.extensions.errorText'),
      );
    });
  });
});
