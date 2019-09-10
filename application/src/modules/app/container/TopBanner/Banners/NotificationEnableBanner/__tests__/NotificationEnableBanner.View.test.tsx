/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-28 10:31:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { NotificationEnableBannerView } from '../NotificationEnableBanner.View';
import { ThemeProvider } from 'styled-components';
import { theme } from 'shield/utils';
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { config } from '@/modules/notification/module.config';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

const baseProps = {
  t: (key: string) => key,
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
        'notification.topBanner.enablePermissionMessage',
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
      expect(Notification.requestPermission).toHaveBeenCalled();
    });
    it('should render view with certain text when isShow is true and isBlocked is true [JPT-2085] 3', () => {
      const props = {
        ...baseProps,
        isShow: true,
        isBlocked: true,
      };
      const wrapper = shallow(<NotificationEnableBannerView {...props} />);
      expect(wrapper.find('JuiSnackbarContent').prop('message')).toEqual(
        'notification.topBanner.blockedPermissionMessage',
      );
      expect(wrapper.find('JuiSnackbarContent').prop('action')[0]).toEqual(
        null,
      );
    });
  });
});
