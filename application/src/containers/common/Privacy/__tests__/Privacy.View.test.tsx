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
    it('Display flash toast notification when change team from public/private to private/public failed. [JPT-491][JPT-492]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        isOffline: false,
        handlePrivacy: () => ErrorTypes.SERVICE_INVALID_MODEL_ID,
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

describe('PrivacyView', () => {
  describe('render()', () => {
    it('Display flash toast notification when change team from public/private to private/public without network. [JPT-520][JPT-521]', (done: jest.DoneCallback) => {
      const props: any = {
        ...someProps,
        isOffline: true,
        handlePrivacy: () => true,
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
