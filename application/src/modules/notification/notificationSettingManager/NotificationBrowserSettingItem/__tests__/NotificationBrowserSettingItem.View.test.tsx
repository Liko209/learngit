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

function setUpMock(browserPermission: NotificationPermission) {
  return {
    settingItemEntity: {
      value: {
        browserPermission,
        wantNotifications: true,
        desktopNotifications: browserPermission === 'granted',
      },
    } as SettingModel<DesktopNotificationsSettingModel>,
    setToggleState: jest.fn().mockImplementation(() => {}),
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
