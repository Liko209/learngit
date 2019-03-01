/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-28 17:18:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { PinView } from '../Pin.View';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';

jest.mock('@/containers/Notification');

describe('PinView', () => {
  describe('render()', () => {
    function setUpMock(
      isPin: boolean,
      shouldShowPinOption: boolean,
      shouldDisablePinOption: boolean,
      isFailed: boolean,
    ) {
      const pinFun = async (toPin: boolean): Promise<void> => {
        throw new Error('test');
      };
      const props: any = {
        isPin,
        shouldShowPinOption,
        shouldDisablePinOption,
        pin: pinFun,
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      return props;
    }

    it('should display flash toast notification when pin post failed. [JPT-1260, JPT-1258]', (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, false, true);
      const Wrapper = shallow(<PinView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
        done();
      },         0);
    }, 2);

    it('should display flash toast notification when unpin post failed. [JPT-1262, JPT-1259]', (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, false, true);
      const Wrapper = shallow(<PinView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
        done();
      },         0);
    }, 2);
  });
});
