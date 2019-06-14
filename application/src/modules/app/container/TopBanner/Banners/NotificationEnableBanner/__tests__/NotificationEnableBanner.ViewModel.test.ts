/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-04 10:55:33
 * Copyright © RingCentral. All rights reserved.
 */

import { NotificationEnableBannerViewModel } from '../NotificationEnableBanner.ViewModel';
import * as userAgent from '@/common/isUserAgent';
import { getEntity } from '@/store/utils/entities';
jest.mock('@/store/utils/entities');

function setUpMock(
  isElectron: boolean,
  browserPermission: NotificationPermission,
  wantNotifications: boolean,
) {
  userAgent.isElectron = isElectron;
  getEntity.mockReturnValue({
    value: {
      browserPermission,
      wantNotifications,
    },
  });
}

describe('NotificationEnableBannerViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('isShow', () => {
    it('should return false when value is undefined', () => {
      getEntity.mockReturnValue({});
      const viewModel = new NotificationEnableBannerViewModel();
      expect(viewModel.isShow).toBe(false);
    });
    it('should return false when in Electron [JPT-2093]', () => {
      setUpMock(true, 'default', true);
      const viewModel = new NotificationEnableBannerViewModel();
      expect(viewModel.isShow).toBe(false);
    });
    it('should return false when wantNotifications is false', () => {
      setUpMock(false, 'granted', false);
      const viewModel = new NotificationEnableBannerViewModel();
      expect(viewModel.isShow).toBe(false);
    });
    it('should return false when browserPermission is "granted"', () => {
      setUpMock(false, 'granted', true);
      const viewModel = new NotificationEnableBannerViewModel();
      expect(viewModel.isShow).toBe(false);
    });
    it('should return true when browserPermission is not "granted" and wantNotifications is true and not on Electron', () => {
      setUpMock(false, 'default', true);
      const viewModel = new NotificationEnableBannerViewModel();
      expect(viewModel.isShow).toBe(true);
    });
  });
  describe('isBlocked', () => {
    it('should return false when value is undefined', () => {
      getEntity.mockReturnValue({});
      const viewModel = new NotificationEnableBannerViewModel();
      expect(viewModel.isBlocked).toBe(false);
    });
    it('should return true when browserPermission is "denied"', () => {
      setUpMock(false, 'denied', false);
      const viewModel = new NotificationEnableBannerViewModel();
      expect(viewModel.isBlocked).toBe(true);
    });
  });
  describe('handleClose()', () => {
    it('should change isClose to true when call the function', () => {
      const viewModel = new NotificationEnableBannerViewModel();
      expect(viewModel.isClosed).toBeFalsy();
      viewModel.handleClose();
      expect(viewModel.isClosed).toBeTruthy();
    });
  });
});
