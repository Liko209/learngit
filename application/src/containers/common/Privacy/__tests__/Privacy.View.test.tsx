/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2018-12-19 16:24:48
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { PrivacyView } from '../Privacy.View';
import { Notification } from '@/containers/Notification';
import { JuiIconButton } from 'jui/components/Buttons';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
jest.mock('@/containers/Notification');

const someProps = {
  t: (str: string) => {},
  isPublic: true,
  isAdmin: true,
  isTeam: true,
  id: 123,
  size: 'small',
};

describe('PrivacyView', () => {
  describe('render()', () => {
    it('should display flash toast notification when change team from public to private failed. [JPT-491]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        handlePrivacy: () => {
          throw new JServerError(ERROR_CODES_SERVER.GENERAL, '');
        },
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      const wrapper = shallow(<PrivacyView {...props} />);
      wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.markPrivateServerErrorForTeam',
          }),
        );
        done();
      },         0);
    });

    it('should display flash toast notification when change team from private to public failed. [JPT-492]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        isPublic: false,
        handlePrivacy: () => {
          throw new JServerError(ERROR_CODES_SERVER.GENERAL, '');
        },
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      const wrapper = shallow(<PrivacyView {...props} />);
      wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.markPrivateServerErrorForTeam',
          }),
        );
        done();
      },         0);
    });

    it('should display flash toast notification when change team from public to private without network. [JPT-520]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        handlePrivacy: () => {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
        },
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      const wrapper = shallow(<PrivacyView {...props} />);
      wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.teamNetError',
          }),
        );
        done();
      },         0);
    });

    it('should display flash toast notification when change team from private to public without network. [JPT-521]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        isPublic: false,
        handlePrivacy: () => {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
        },
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      const wrapper = shallow(<PrivacyView {...props} />);
      wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'people.prompt.teamNetError',
          }),
        );
        done();
      },         0);
    });

    it('should be not button when isTeam is false. [JPT-491]', () => {
      const props: any = {
        ...someProps,
        isTeam: false,
      };
      const wrapper = shallow(<PrivacyView {...props} />);
      expect(wrapper.find(JuiIconButton).length).toBe(0);
    });
  });
});
