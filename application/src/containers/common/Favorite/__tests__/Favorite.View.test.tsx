/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-23 10:33:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { FavoriteView } from '../Favorite.View';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';

jest.mock('@/containers/Notification');

function setUpMock(
  isFavorite: boolean,
  isFailed: boolean,
  errorType: 'network' | 'server',
) {
  return {
    isFavorite,
    id: 1,
    isMember: true,
    conversationId: 1,
    getConversationId() {},
    handlerFavorite: jest.fn().mockImplementationOnce(() => {
      if (errorType === 'network') {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      }
      if (errorType === 'server') {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      }
    }),
    dataTrackingProps: {
      source: '',
      conversationType: '',
    },
  };
}

describe('FavoriteView', () => {
  describe('render()', () => {
    beforeEach(() => {
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
    });

    it('display flash toast notification when unfavorite conversation failed for backend issue.[JPT-489]', async (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'server');
      const Wrapper = shallow(<FavoriteView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.handlerFavorite).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.notAbleToUnFavoriteForServerIssue',
        }),
      );
      done();
    });

    it('display flash toast notification when favorite conversation failed for backend issue.[JPT-488]', async (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, 'server');
      const Wrapper = shallow(<FavoriteView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.handlerFavorite).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.notAbleToFavoriteThisMessageForServerIssue',
        }),
      );
      done();
    });

    it('display flash toast notification when unfavorite conversation failed for network issue.[JPT-489]', async (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'network');
      const Wrapper = shallow(<FavoriteView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.handlerFavorite).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.notAbleToUnFavoriteForNetworkIssue',
        }),
      );
      done();
    });

    it('display flash toast notification when favorite conversation failed for network issue.[JPT-488]', async (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, 'network');
      const Wrapper = shallow(<FavoriteView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.handlerFavorite).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.notAbleToFavoriteThisMessageForNetworkIssue',
        }),
      );
      done();
    });
  });
});
