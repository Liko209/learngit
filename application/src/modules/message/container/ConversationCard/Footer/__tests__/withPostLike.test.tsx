/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-07 10:24:22
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { mount } from 'enzyme';
import { ThemeProvider } from 'styled-components';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import { getEntity, getGlobalValue } from '@/store/utils';
import { ERROR_CODES_NETWORK, JNetworkError, JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { WithPostLikeComponentProps } from '../withPostLike/types';
import { theme } from '@/__tests__/utils';
import { withPostLike } from '../withPostLike';

jest.mock('@/containers/Notification');
jest.mock('@/store/utils');

@withPostLike
class ButtonView extends Component<WithPostLikeComponentProps> {
  render() {
    const { iLiked, onToggleLike } = this.props;
    return (
      <JuiIconButton onClick={onToggleLike}>
        {iLiked ? 'like' : 'unlike'}
      </JuiIconButton>
    );
  }
}

const mountWithTheme = (content: React.ReactNode) =>
  mount(<ThemeProvider theme={theme}>{content}</ThemeProvider>);

const userId = 1;
(getGlobalValue as jest.Mock).mockReturnValue(userId);

function setUpMock(iLiked: boolean, isFailed: boolean, errorType: 'network' | 'server') {
  const postService = {
    likePost: jest.fn().mockImplementationOnce(() => {
      if (errorType === 'network') {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      }
      if (errorType === 'server') {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      }
    }),
  };
  const post = {
    likes: iLiked ? [userId, 0] : [0],
  };

  (getEntity as jest.Mock).mockImplementation(() => post);
  ServiceLoader.getInstance = jest.fn().mockReturnValueOnce(postService);
  const LikeView = mountWithTheme(<ButtonView />);
  return LikeView;
}

describe('LikeView', () => {
  describe('render()', () => {
    beforeEach(() => {
      Notification.flashToast = jest.fn().mockImplementationOnce(() => { });
    });

    it('Unlike failed due to backend issue.', async (done: jest.DoneCallback) => {
      const Wrapper = setUpMock(true, true, 'server');
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToUnlikeForServerIssue',
        }),
      );
      done();
    });

    it('Like failed due to backend issue.', async (done: jest.DoneCallback) => {
      const Wrapper = setUpMock(false, true, 'server');
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToLikeThisMessageForServerIssue',
        }),
      );
      done();
    });

    it('Unlike failed due to network disconnection.', async (done: jest.DoneCallback) => {
      const Wrapper = setUpMock(true, true, 'network');
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToUnlikeForNetworkIssue',
        }),
      );
      done();
    });

    it('Like failed due to network disconnection.', async (done: jest.DoneCallback) => {
      const Wrapper = setUpMock(false, true, 'network');
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToLikeThisMessageForNetworkIssue',
        }),
      );
      done();
    });
  });
});
