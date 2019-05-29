/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-27 16:34:19
 * Copyright © RingCentral. All rights reserved.
 */

import { UmiViewModel } from '../Umi.ViewModel';
import { UmiProps, UMI_SECTION_TYPE } from '../types';
import { getEntity } from '@/store/utils';

jest.mock('framework');

describe('UmiViewModel', () => {
  let viewModel: UmiViewModel;

  beforeEach(() => {
    const props: UmiProps = {
      type: UMI_SECTION_TYPE.FAVORITE,
    };
    viewModel = new UmiViewModel(props);
  });

  describe('_unreadInfo', () => {
    it('should get single unread when type is single', () => {
      viewModel['props'].type = UMI_SECTION_TYPE.SINGLE;
      const mockUnread = 'mockUnread';
      viewModel['_getSingleUnreadInfo'] = jest.fn().mockReturnValue(mockUnread);

      expect(viewModel['_unreadInfo']).toEqual(mockUnread);
    });

    it('should get section unread when type is not single', () => {
      viewModel['props'].type = UMI_SECTION_TYPE.TEAM;
      const mockUnread = 'mockUnread';
      viewModel['_getSectionUnreadInfo'] = jest
        .fn()
        .mockReturnValue(mockUnread);

      expect(viewModel['_unreadInfo']).toEqual(mockUnread);
    });
  });

  describe('_getSingleUnreadInfo', () => {
    it('should do nothing when id is invalid', () => {
      viewModel['props'].id = undefined;

      expect(viewModel['_getSingleUnreadInfo']()).toEqual({
        unreadCount: 0,
        important: false,
      });
    });

    it('should get correct unread when id is valid and unreadCount === 0', () => {
      viewModel['props'].id = 123;
      const mockState = {
        unreadMentionsCount: 54,
      };
      const mockGroup = {
        isTeam: false,
      };
      // @ts-ignore
      getEntity = jest
        .fn()
        .mockReturnValueOnce(mockState)
        .mockReturnValueOnce(mockGroup);

      expect(viewModel['_getSingleUnreadInfo']()).toEqual({
        unreadCount: 0,
        important: false,
      });
    });

    it('should get correct unread when id is valid and unreadCount > 0', () => {
      viewModel['props'].id = 123;
      const mockState = {
        unreadCount: 12,
        unreadMentionsCount: 54,
      };
      const mockGroup = {
        isTeam: true,
      };
      // @ts-ignore
      getEntity = jest
        .fn()
        .mockReturnValueOnce(mockState)
        .mockReturnValueOnce(mockGroup);

      expect(viewModel['_getSingleUnreadInfo']()).toEqual({
        unreadCount: 54,
        important: true,
      });
    });
  });
});
