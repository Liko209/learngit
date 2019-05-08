/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-11 09:33:11
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { LikeView } from '../Like.View';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import { ERROR_CODES_NETWORK, JNetworkError, JServerError, ERROR_CODES_SERVER } from 'sdk/error';

jest.mock('@/containers/Notification');

function setUpMock(isLike: boolean, isFailed: boolean, errorType: 'network' | 'server') {
  return {
    isLike,
    like: jest.fn().mockImplementationOnce(() => {
      if (errorType === 'network') {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      }
      if (errorType === 'server') {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      }
    }),
  };
}

describe('LikeView', () => {
  describe('render()', () => {
    beforeEach(() => {
      Notification.flashToast = jest.fn().mockImplementationOnce(() => { });
    });

    it('Unlike failed due to backend issue. [JPT-1783]', async (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'server');
      const Wrapper = shallow(<LikeView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.like).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToUnlikeForServerIssue',
        }),
      );
      done();
    });

    it('Like failed due to backend issue. [JPT-1786]', async (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, 'server');
      const Wrapper = shallow(<LikeView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.like).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToLikeThisMessageForServerIssue',
        }),
      );
      done();
    });

    it('Unlike failed due to network disconnection. [JPT-1785]', async (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'network');
      const Wrapper = shallow(<LikeView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.like).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToUnlikeForNetworkIssue',
        }),
      );
      done();
    });

    it('Like failed due to network disconnection. [JPT-1787]', async (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, 'network');
      const Wrapper = shallow(<LikeView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.like).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToLikeThisMessageForNetworkIssue',
        }),
      );
      done();
    });
  });
});
