/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-30 14:14:47
 * Copyright © RingCentral. All rights reserved.
 */

import { NotificationBrowserSettingItemView } from '../NotificationBrowserSettingItem.View';
import React from 'react';
import SettingModel from '@/store/models/UserSetting';
import { DesktopNotificationsSettingModel } from 'sdk/module/profile';
import { shallow } from 'enzyme';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { Notification } from '@/containers/Notification';
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { config } from '../../../module.config';

jest.mock('@/containers/Notification');
const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

function setUpMock(
  browserPermission: NotificationPermission,
  errorType?: 'network' | 'server',
) {
  Notification.flashToast = jest.fn().mockImplementation(() => {});
  Notification.flagWarningToast = jest.fn().mockImplementation(() => {});
  global.Notification = {
    requestPermission: jest.fn().mockImplementation(() => Promise.resolve()),
    permission: browserPermission,
  };
  return {
    settingItemEntity: {
      value: {
        browserPermission,
        wantNotifications: true,
        desktopNotifications: browserPermission === 'granted',
      },
    } as SettingModel<DesktopNotificationsSettingModel>,
    setToggleState: jest.fn().mockImplementation(() => {
      if (errorType === 'network') {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      }
      if (errorType === 'server') {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      }
    }),
  };
}

describe('NotificationBrowserSettingItemView', () => {
  describe('render()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('Given that browser permission is "default", should call _requestPermission when user try to switch the toggle from off to on', async () => {
      const props = setUpMock('default');
      const wrapper = shallow(
        <NotificationBrowserSettingItemView {...props} />,
      );
      const instance = wrapper.instance();
      jest
        .spyOn(instance, '_requestPermission')
        .mockImplementation(() => 'default');
      instance.handleToggleChange(null, true);
      expect(instance._requestPermission).toHaveBeenCalled();
    });
    it('Given that browser permission is "default", should show flag toast when switch the toggle from off to on and the browser permission changes to "denied"', async () => {
      const props = setUpMock('default');
      const wrapper = shallow(
        <NotificationBrowserSettingItemView {...props} />,
      );
      const instance = wrapper.instance();
      jest
        .spyOn(instance, '_requestPermission')
        .mockImplementation(() => 'denied');
      await instance.handleToggleChange(null, true);
      expect(Notification.flagWarningToast).toHaveBeenCalledWith('notification.notificationPermissionBlocked');
    });
    it('Given that browser permission is "default", should call _showEnabledNotification when switch the toggle from off to on and the browser permission changes to "granted"', async () => {
      const props = setUpMock('default');
      const wrapper = shallow(
        <NotificationBrowserSettingItemView {...props} />,
      );
      const instance = wrapper.instance();
      instance._showEnabledNotification = jest.fn();
      jest
        .spyOn(instance, '_requestPermission')
        .mockImplementation(() => 'granted');
      await instance.handleToggleChange(null, true);
      expect(instance._showEnabledNotification).toHaveBeenCalled();
    });
    it('Given that browser permission is "granted", should call _showEnabledNotification when user switch the toggle from off to on', async () => {
      const props = setUpMock('granted');
      const wrapper = shallow(
        <NotificationBrowserSettingItemView {...props} />,
      );
      const instance = wrapper.instance();
      instance._showEnabledNotification = jest.fn();
      await instance.handleToggleChange(null, true);
      expect(instance._showEnabledNotification).toHaveBeenCalled();
    });
    it('Given that browser permission is "denied", should show flag toast when user try to switch the toggle from off to on', async () => {
      const props = setUpMock('denied');
      const wrapper = shallow(
        <NotificationBrowserSettingItemView {...props} />,
      );
      await wrapper.instance().handleToggleChange(null, true);
      expect(Notification.flagWarningToast).toHaveBeenCalledWith('notification.notificationPermissionBlocked');
    });
    it('Should display flash toast notification when setToggleState failed for network issue', async () => {
      const props = setUpMock('granted', 'network');
      const wrapper = shallow(
        <NotificationBrowserSettingItemView {...props} />,
      );
      await wrapper.instance().handleToggleChange(null, true);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'setting.errorText.network',
        }),
      );
    });
    it('Should display flash toast notification when setToggleState failed for server issue', async () => {
      const props = setUpMock('granted', 'server');
      const wrapper = shallow(
        <NotificationBrowserSettingItemView {...props} />,
      );
      await wrapper.instance().handleToggleChange(null, true);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'setting.errorText.server',
        }),
      );
    });

    describe('waitForPermission', () => {
      it('should be true when call requestPermission', async () => {
        const props = setUpMock('default');
        const wrapper = shallow(
          <NotificationBrowserSettingItemView {...props} />,
        );
        await wrapper.instance()._requestPermission();
        expect(wrapper.state('waitForPermission')).toBeTruthy();
      });
      it('should be false when toggle on from off and call requestPermission then allow but setToggleState failed for server issue', async () => {
        const props = setUpMock('default', 'server');
        const wrapper = shallow(
          <NotificationBrowserSettingItemView {...props} />,
        );
        global.Notification.requestPermission = jest
          .fn()
          .mockImplementation(() => Promise.resolve('granted'));
        await wrapper.instance().handleToggleChange(null, true);
        expect(props.setToggleState).toHaveBeenCalled();
        expect(wrapper.state('waitForPermission')).toBeFalsy();
      });
    });
  });
});
