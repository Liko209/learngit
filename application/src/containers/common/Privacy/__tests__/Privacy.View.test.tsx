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
import { ErrorTypes } from 'sdk/utils/';
jest.mock('@/containers/Notification');

const someProps = {
  t: (str: string) => { },
  isPublic: true,
  isAdmin: true,
  id: 123,
  size: 'small',
};

describe('PrivacyView', () => {
  describe('render()', () => {
    it('Display flash toast notification when change team from public to private failed. [JPT-491]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        handlePrivacy: () => { throw ErrorTypes.SERVICE_INVALID_MODEL_ID; },
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => { });
      const wrapper = shallow(<PrivacyView {...props} />);
      wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
        done();
      },         0);
    });

    it('Display flash toast notification when change team from private to public failed. [JPT-492]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        isPublic: false,
        handlePrivacy: () => { throw ErrorTypes.SERVICE_INVALID_MODEL_ID; },
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => { });
      const wrapper = shallow(<PrivacyView {...props} />);
      wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
        done();
      },         0);
    });

    it('Display flash toast notification when change team from public to private without network. [JPT-520]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        handlePrivacy: () => { throw ErrorTypes.API_NETWORK; },
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => { });
      const wrapper = shallow(<PrivacyView {...props} />);
      wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
        done();
      },         0);
    });

    it('Display flash toast notification when change team from private to public without network. [JPT-521]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        isPublic: false,
        handlePrivacy: () => { throw ErrorTypes.API_NETWORK; },
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => { });
      const wrapper = shallow(<PrivacyView {...props} />);
      wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
        done();
      },         0);
    });
  });
});
