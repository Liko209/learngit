/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { FileNameEditActionViewModel } from '../FileNameEditAction.ViewModel';
import { getEntity } from '../../../../../store/utils';
import * as utils from '@/utils/error';
import { ItemService } from 'sdk/module/item';
import { Notification } from '@/containers/Notification';
import {
  errorHelper,
  JServerError,
  JNetworkError,
  ERROR_CODES_SERVER,
  ERROR_CODES_NETWORK,
} from 'sdk/error';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/module/group', () => ({
  ItemService: jest.fn(),
}));

jest.mock('@/containers/Notification');
jest.mock('@/utils/error');
jest.mock('../../../../../store/utils');
const itemService = new ItemService();

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

describe('FileNameEditActionViewModel', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('canEditFileName()', () => {
    it('should be return permissions true', () => {
      const group = { isThePersonGuest: () => false };
      const vm = new FileNameEditActionViewModel();
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(vm.canEditFileName).toEqual(true);
    });
  });
  describe('handleEditFileName()', () => {
    it('Show a flash toast after the user clicks Save button on rename file dialog in offline mode [JPT-2076]', async () => {
      itemService.editFileName = jest
        .fn()
        .mockRejectedValueOnce(
          new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, ''),
        );
      const vm = new FileNameEditActionViewModel();
      (getEntity as jest.Mock).mockReturnValue({ id: 1 });
      await vm.handleEditFileName();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('message.prompt.editFileNameNetworkError'),
      );
    });
    it('Show a flash toast after the user clicks Save button on rename file dialog when backend error [JPT-2077]', async () => {
      itemService.editFileName = jest
        .fn()
        .mockRejectedValueOnce(
          new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
        );
      const vm = new FileNameEditActionViewModel();
      (getEntity as jest.Mock).mockReturnValue({ id: 1 });
      await vm.handleEditFileName();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('message.prompt.editFileNameBackendError'),
      );
    });
  });

  describe('formatFileName()', () => {
    it('The filename field of blanks at the beginning of the input should be ignored [JPT-2072]', () => {
      const vm = new FileNameEditActionViewModel();
      expect(vm.formatFileName('    1/?,*:&')).toEqual('1______');
    });
  });
});
