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
    bookmark: async (toBookmark: boolean): Promise<void> => {
      if (errorType === 'network') {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
      }
      if (errorType === 'server') {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, '');
      }
    },
  };
}

describe('BookmarkView', () => {
  describe('render()', () => {
    beforeEach(() => {
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
    });

    it('should display flash toast notification when remove bookmark failed for backend issue.[JPT-1529]', (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'server');
      const Wrapper = shallow(<BookmarkView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'message.prompt.notAbleToRemoveYourBookmarkForServerIssue',
          }),
        );
        done();
      },         0);
    });

    it('should display flash toast notification when bookmark failed for backend issue.[JPT-1530]', (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, 'server');
      const Wrapper = shallow(<BookmarkView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'message.prompt.notAbleToBookmarkThisMessageForServerIssue',
          }),
        );
        done();
      },         0);
    });

    it('should display flash toast notification when remove bookmark failed for network issue.[JPT-1531]', (done: jest.DoneCallback) => {
      const props = setUpMock(true, true, 'network');
      const Wrapper = shallow(<BookmarkView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'message.prompt.notAbleToRemoveYourBookmarkForNetworkIssue',
          }),
        );
        done();
      },         0);
    });

    it('should display flash toast notification when bookmark failed for network issue.[JPT-1532]', (done: jest.DoneCallback) => {
      const props = setUpMock(false, true, 'network');
      const Wrapper = shallow(<BookmarkView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'message.prompt.notAbleToBookmarkThisMessageForNetworkIssue',
          }),
        );
        done();
      },         0);
    });
  });
});
