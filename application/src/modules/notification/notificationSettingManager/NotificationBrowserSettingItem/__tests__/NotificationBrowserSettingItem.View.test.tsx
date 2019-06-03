/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-30 14:14:47
 * Copyright © RingCentral. All rights reserved.
 */

import { NotificationBrowserSettingItemView } from '../NotificationBrowserSettingItem.View';
jest.mock('@/utils/i18nT', () => (key: string) => key);
import React from 'react';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import SettingModel from '@/store/models/UserSetting';
import { DesktopNotificationsSettingModel } from 'sdk/module/profile';
import { JuiToggleButton } from 'jui/components/Buttons';
// import { mountWithTheme } from 'shield/utils';
import { shallow } from 'enzyme';
import { catchError } from '@/common/catchError';
import { Notification } from '@/containers/Notification';
jest.mock('@/containers/Notification');
// alessia[todo]: mock getEntity 的值，判断是否去 request 或者 openDialog
function setUpMock(
  browserPermission: NotificationPermission,
  errorType?: 'network' | 'server',
) {
  return {
    settingItemEntity: {
      value: {
        browserPermission,
        wantNotifications: true,
        desktopNotifications: browserPermission === 'granted',
      },
    } as SettingModel<Partial<DesktopNotificationsSettingModel>>,
    setToggleState: jest.fn().mockImplementationOnce(() => {}),
  };
}

describe('NotificationBrowserSettingItemView', () => {
  describe('render()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
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
    it('Given that browser permission is "default", should open dialog when switch the toggle from off to on and the browser permission changes to "denied"', async () => {
      const props = setUpMock('default');
      const wrapper = shallow(
        <NotificationBrowserSettingItemView {...props} />,
      );
      const instance = wrapper.instance();
      jest
        .spyOn(instance, '_requestPermission')
        .mockImplementation(() => 'denied');
      await instance.handleToggleChange(null, true);
      expect(wrapper.state('dialogOpen')).toBeTruthy();
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
    it('Given that browser permission is "denied", should open dialog when user try to switch the toggle from off to on', async () => {
      const props = setUpMock('denied');
      const wrapper = shallow(
        <NotificationBrowserSettingItemView {...props} />,
      );
      await wrapper.instance().handleToggleChange(null, true);
      expect(wrapper.state('dialogOpen')).toBeTruthy();
    });
  });
});
