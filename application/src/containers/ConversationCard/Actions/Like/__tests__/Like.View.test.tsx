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
jest.mock('@/containers/Notification');
describe('Like View', () => {
  describe('_handleLikeButton', () => {
    function setUpMock(isLike: boolean, isFailed: boolean) {
      const likeFun = async (
        toLike: boolean,
      ): Promise<{ isFailed: boolean }> => {
        return { isFailed };
      };
      const props = {
        isLike,
        like: likeFun,
      };
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      return props;
    }
    it('should display flash toast notification when like post failed. [JPT-486]', () => {
      const props = setUpMock(false, true);
      const Wrapper = shallow(<LikeView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
      },         500);
    });
    it('should display flash toast notification when unlike post failed. [JPT-487]', () => {
      const props = setUpMock(true, true);
      const Wrapper = shallow(<LikeView {...props} />);
      Wrapper.find(JuiIconButton).simulate('click');
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalled();
      },         500);
    });
  });
});
