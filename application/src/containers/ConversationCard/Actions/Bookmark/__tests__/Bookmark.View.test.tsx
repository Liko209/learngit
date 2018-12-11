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

jest.mock('@/containers/Notification');

describe('BookmarkView', () => {
  describe('render()', () => {
    function setUpMock(isBookmark: boolean, isFailed: boolean) {
      const bookmark = async (
        toBookmark: boolean,
      ): Promise<{ isFailed: boolean }> => {
        return { isFailed };
      };
      const props = {
        isBookmark,
        bookmark,
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      return props;
    }

    it('should display flash toast notification when bookmark post failed. [JPT-332]', () => {
      const props = setUpMock(false, true);
      const Wrapper = shallow(<BookmarkView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
      },         0);
    }, 2);

    it('should display flash toast notification when bookmark post failed. [JPT-333]', () => {
      const props = setUpMock(true, true);
      const Wrapper = shallow(<BookmarkView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
      },         0);
    }, 2);
  });
});
