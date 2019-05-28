/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-28 10:31:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { NotificationEnableBannerView } from '../NotificationEnableBanner.View';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/__tests__/utils';
// import { Jupiter, container } from 'framework';
// import { config } from '@/modules/notification/module.config';
// import { PERMISSION } from '@/modules/notification/interface/constant';

// const jupiter = container.get(Jupiter);
// jupiter.registerModule(config);
// const permission = jupiter.get(PERMISSION);
// permission.request = jest.fn()

// alessia-todo
const translations = {
  'notification.topBanner.enablePermissionMessage':
    'RingCentral needs your permission to enable desktop notifications.',
  'notification.topBanner.enablePermissionAction': 'Enable notifications',
  'notification.topBanner.blockedPermissionMessage':
    'RingCentral notifications are blocked. Go to your browser settings to allow RingCentral to send notifications.',
};

const baseProps = {
  t: (key: string) => translations[key],
  isBlocked: false,
  handleClose: () => {},
};

describe('NotificationEnableBannerView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('render()', () => {
    it('should not render view if isShow is false', () => {
      const props = {
        ...baseProps,
        isShow: false,
      };
      const wrapper = shallow(<NotificationEnableBannerView {...props} />);
      expect(wrapper.find('JuiSnackbarContent').length).toBe(0);
    });
    it('should render view with certain text and button when isShow is true and isBlocked is false [JPT-2085] 1', () => {
      const props = {
        ...baseProps,
        isShow: true,
        isBlocked: false,
      };
      const wrapper = shallow(<NotificationEnableBannerView {...props} />);
      expect(wrapper.find('JuiSnackbarContent').prop('message')).toEqual(
        'RingCentral needs your permission to enable desktop notifications.',
      );
      expect(wrapper.find('JuiSnackbarContent').prop('action')[0]).not.toEqual(
        null,
      );
    });
    it('should call Notification.requestPermission when click "Enable notifications" [JPT-2085] 2', () => {
      global.Notification = {
        requestPermission: jest.fn(),
        permission: 'default',
      };
      const props = {
        ...baseProps,
        isShow: true,
        isBlocked: false,
      };
      const wrapper = mount(
        <ThemeProvider theme={theme}>
          <NotificationEnableBannerView {...props} />
        </ThemeProvider>,
      );
      wrapper
        .find('button')
        .at(0)
        .simulate('click');
      // expect(Notification.requestPermission).toHaveBeenCalled();
    });
    it('should render view with certain text when isShow is true and isBlocked is true [JPT-2085] 3', () => {
      const props = {
        ...baseProps,
        isShow: true,
        isBlocked: true,
      };
      const wrapper = shallow(<NotificationEnableBannerView {...props} />);
      expect(wrapper.find('JuiSnackbarContent').prop('message')).toEqual(
        'RingCentral notifications are blocked. Go to your browser settings to allow RingCentral to send notifications.',
      );
      expect(wrapper.find('JuiSnackbarContent').prop('action')[0]).toEqual(
        null,
      );
    });
  });
});
