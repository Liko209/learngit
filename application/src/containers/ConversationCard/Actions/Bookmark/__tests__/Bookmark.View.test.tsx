/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-11 09:33:08
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { BookmarkView } from '../Bookmark.View';
import { JuiIconButton } from 'jui/components/Buttons';
import { Notification } from '@/containers/Notification';
import { ERROR_CODES_NETWORK, JNetworkError, JServerError, ERROR_CODES_SERVER } from 'sdk/error';

jest.mock('@/containers/Notification');

function setUpMock(isBookmark: boolean, isFailed: boolean, errorType: 'network' | 'server') {
  return {
    isBookmark,
    bookmark: jest.fn().mockImplementationOnce(() => {
      if (errorType === 'network') {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      }
      if (errorType === 'server') {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      }
    }),
  };
}

describe('BookmarkView', () => {
  describe('render()', () => {
    beforeEach(() => {
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
    });

    it('should display flash toast notification when remove bookmark failed for backend issue.[JPT-1529]', async (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'server');
      const Wrapper = shallow(<BookmarkView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.bookmark).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToRemoveYourBookmarkForServerIssue',
        }),
      );
      done();
    });

    it('should display flash toast notification when bookmark failed for backend issue.[JPT-1530]', async (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, 'server');
      const Wrapper = shallow(<BookmarkView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.bookmark).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToBookmarkThisMessageForServerIssue',
        }),
      );
      done();
    });

    it('should display flash toast notification when remove bookmark failed for network issue.[JPT-1531]', async (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'network');
      const Wrapper = shallow(<BookmarkView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.bookmark).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToRemoveYourBookmarkForNetworkIssue',
        }),
      );
      done();
    });

    it('should display flash toast notification when bookmark failed for network issue.[JPT-1532]', async (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, 'network');
      const Wrapper = shallow(<BookmarkView {...props} />);
      await Wrapper.find(JuiIconButton).simulate('click');
      expect(props.bookmark).toHaveBeenCalledTimes(1);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.notAbleToBookmarkThisMessageForNetworkIssue',
        }),
      );
      done();
    });
  });
});
