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
  beforeEach(() => {
    Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
  });
  afterEach(() => {
    jest.clearAllMocks()
  });
  describe('render()', () => {
    it('should display flash toast notification when change team from public to private failed. [JPT-491]', async () => {
      const props: any = {
        ...someProps,
        handlePrivacy: () => {
          throw new JServerError(ERROR_CODES_SERVER.GENERAL, '');
        },
      };
      const wrapper = shallow(<PrivacyView {...props} />);
      await wrapper.find(JuiIconButton).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.changeTeamPrivateTypeErrorForServerIssue',
        }),
      );
    });

    it('should display flash toast notification when change team from private to public failed. [JPT-492]', async () => {
      const props: any = {
        ...someProps,
        isPublic: false,
        handlePrivacy: () => {
          throw new JServerError(ERROR_CODES_SERVER.GENERAL, '');
        },
      };
      const wrapper = shallow(<PrivacyView {...props} />);
      await wrapper.find(JuiIconButton).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.changeTeamPrivateTypeErrorForServerIssue',
        }),
      );
    });

    it('should display flash toast notification when change team from public to private without network. [JPT-520]', async () => {
      const props: any = {
        ...someProps,
        handlePrivacy: () => {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
        },
      };
      const wrapper = shallow(<PrivacyView {...props} />);
      await wrapper.find(JuiIconButton).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.changeTeamPrivateTypeErrorForNetworkIssue',
        }),
      );
    });

    it('should display flash toast notification when change team from private to public without network. [JPT-521]', async () => {
      const props: any = {
        ...someProps,
        isPublic: false,
        handlePrivacy: () => {
          throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
        },
      };
      const wrapper = shallow(<PrivacyView {...props} />);
      await wrapper.find(JuiIconButton).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.changeTeamPrivateTypeErrorForNetworkIssue',
        }),
      );
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
