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
import { JError } from 'sdk/error';

jest.mock('@/containers/Notification');

describe('BookmarkView', () => {
  describe('render()', () => {
    function setUpMock(isBookmark: boolean, isFailed: boolean) {
      const bookmark = async (toBookmark: boolean): Promise<void> => {
        throw new JError('test', 'test', '');
      };
      const props = {
        isBookmark,
        bookmark,
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      return props;
    }

    it('should display flash toast notification when bookmark post failed. [JPT-332]', (done: jest.DoneCallback) => {
      const props = setUpMock(false, true);
      const Wrapper = shallow(<BookmarkView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
        done();
      },         0);
    }, 2);

    it('should display flash toast notification when bookmark post failed. [JPT-333]', (done: jest.DoneCallback) => {
      const props = setUpMock(true, true);
      const Wrapper = shallow(<BookmarkView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
        done();
      },         0);
    }, 2);
  });
});
