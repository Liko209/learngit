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
import { ERROR_CODES_NETWORK, JNetworkError, JServerError, ERROR_CODES_SERVER } from 'sdk/error';

jest.mock('@/containers/Notification');

function setUpMock(
  isPin: boolean,
  shouldShowPinOption: boolean,
  shouldDisablePinOption: boolean,
  errorType: 'network' | 'server' | 'permission' | 'not-support',
) {
  return {
    isPin,
    shouldShowPinOption,
    shouldDisablePinOption,
    pin: jest.fn().mockImplementationOnce(() => {
      if (errorType === 'network') {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      }
      if (errorType === 'server') {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      }
    }),
  };
}

describe('PinView', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
  });
  describe('render()', () => {
    it('Failed to pin message due to unexpected backend issue. [JPT-1827]', async () => {
      const props = setUpMock(false, true, false, 'server');
      const Wrapper = shallow(<PinView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.pin).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToPinForServerIssue',
        }),
      );
    });

    it('Failed to pin message due to network disconnection. [JPT-1828]', async () => {
      const props = setUpMock(false, true, false, 'network');
      const Wrapper = shallow(<PinView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.pin).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToPinForNetworkIssue',
        }),
      );
    });

    it('Failed to unpin message due to unexpected backend issue. [JPT-1829]', async () => {
      const props = setUpMock(true, true, false, 'server');
      const Wrapper = shallow(<PinView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.pin).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToUnpinForServerIssue',
        }),
      );
    });

    it('Failed to unpin message due to network disconnection. [JPT-1830]', async () => {
      const props = setUpMock(true, true, false, 'network');
      const Wrapper = shallow(<PinView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.pin).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToUnpinForNetworkIssue',
        }),
      );
    });

    it('should pin/unpin button should be disabled when user do not have permission [JPT-1250]', () => {
      const props = setUpMock(true, true, true, 'permission');
      const Wrapper = shallow(<PinView {...props} />);
      expect(Wrapper.find(JuiIconButton).get(0).props.disabled).toBe(true);
    });

    it('should pin/unpin button should no be shown when type of post cannot support pin function [JPT-1255]', () => {
      const props = setUpMock(true, false, false, 'not-support');
      const Wrapper = shallow(<PinView {...props} />);
      expect(Wrapper.find(JuiIconButton).get(0)).toBe(undefined);
    });
  });
});
