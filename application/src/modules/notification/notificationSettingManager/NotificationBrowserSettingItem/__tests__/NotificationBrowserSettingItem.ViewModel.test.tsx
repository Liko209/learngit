/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-30 14:14:47
 * Copyright © RingCentral. All rights reserved.
 */

import { NotificationBrowserSettingItemViewModel } from '../NotificationBrowserSettingItem.ViewModel';
jest.mock('@/utils/i18nT', () => (key: string) => key);
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { Notification } from '@/containers/Notification';
jest.mock('@/containers/Notification');

function setUpMock(errorType: 'network' | 'server') {
  (NotificationBrowserSettingItemViewModel.prototype.settingItemEntity.valueSetter = jest
    .fn()
    .mockImplementation(() => {
      if (errorType === 'network') {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      }
      if (errorType === 'server') {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      }
    })),
    (Notification.flashToast = jest.fn().mockImplementation(() => {}));
}

describe('NotificationBrowserSettingItemView', () => {
  describe('render()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('Should display flash toast notification when setToggleState failed for network issue', async () => {
      setUpMock('network');
      const vm = new NotificationBrowserSettingItemViewModel();
      await vm.setToggleState(true);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'setting.errorText.network',
        }),
      );
    });
    it('Should display flash toast notification when setToggleState failed for server issue', async () => {
      setUpMock('server');
      const vm = new NotificationBrowserSettingItemViewModel();
      await vm.setToggleState(true);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'setting.errorText.server',
        }),
      );
    });
  });
});
