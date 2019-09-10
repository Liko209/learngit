/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-27 16:34:19
 * Copyright © RingCentral. All rights reserved.
 */
import { UmiViewModel } from '../Umi.ViewModel';
import { UmiProps, UMI_SECTION_TYPE } from '../types';
import * as utils from '@/store/utils';
import { NEW_MESSAGE_BADGES_OPTIONS } from 'sdk/module/profile/constants';
import { jupiter } from 'framework/Jupiter';
import { AppStore } from '@/modules/app/store';
import { ENTITY_NAME } from '@/store';

describe('UmiViewModel', () => {
  jupiter.registerClass(AppStore);

  let viewModel: UmiViewModel;
  let currentSetting = {
    value: NEW_MESSAGE_BADGES_OPTIONS.GROUPS_AND_MENTIONS,
  };
  beforeEach(() => {
    jest.clearAllMocks();
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
    it('should do nothing when badge setting is invalid', () => {
      viewModel['props'].id = undefined;
      jest.spyOn(utils, 'getEntity').mockReturnValueOnce({ isMocked: true });
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
      jest.spyOn(utils, 'getEntity').mockImplementation((name: ENTITY_NAME) => {
        switch (name) {
          case ENTITY_NAME.USER_SETTING:
            return {
              isMocked: false,
              value: currentSetting,
            };
          case ENTITY_NAME.GROUP:
            return mockGroup;
          case ENTITY_NAME.GROUP_STATE:
            return mockState;
        }
      });

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
      jest.spyOn(utils, 'getEntity').mockImplementation((name: ENTITY_NAME) => {
        switch (name) {
          case ENTITY_NAME.USER_SETTING:
            return {
              isMocked: false,
              value: NEW_MESSAGE_BADGES_OPTIONS.GROUPS_AND_MENTIONS,
            };
          case ENTITY_NAME.GROUP:
            return mockGroup;
          case ENTITY_NAME.GROUP_STATE:
            return mockState;
        }
      });

      expect(viewModel['_getSingleUnreadInfo']()).toEqual({
        unreadCount: 54,
        important: true,
      });
    });

    it('should get correct unread when id is valid and unreadCount > 0 and umi setting is to display all', () => {
      currentSetting = NEW_MESSAGE_BADGES_OPTIONS.ALL;

      viewModel['props'].id = 123;
      const mockState = {
        unreadCount: 12,
        unreadMentionsCount: 54,
      };
      const mockGroup = {
        isTeam: true,
      };
      jest.spyOn(utils, 'getEntity').mockImplementation((name: ENTITY_NAME) => {
        switch (name) {
          case ENTITY_NAME.USER_SETTING:
            return {
              isMocked: false,
              value: currentSetting,
            };
          case ENTITY_NAME.GROUP:
            return mockGroup;
          case ENTITY_NAME.GROUP_STATE:
            return mockState;
        }
      });

      expect(viewModel['_getSingleUnreadInfo']()).toEqual({
        unreadCount: 12,
        important: true,
      });
    });
    it('should get correct unread when id is valid and unreadCount > 0 and umi setting is unset', () => {
      viewModel['props'].id = 123;
      const mockState = {
        unreadCount: 12,
        unreadMentionsCount: 54,
      };
      const mockGroup = {
        isTeam: true,
      };

      jest.spyOn(utils, 'getEntity').mockImplementation((name: ENTITY_NAME) => {
        switch (name) {
          case ENTITY_NAME.USER_SETTING:
            return {
              isMocked: false,
            };
          case ENTITY_NAME.GROUP:
            return mockGroup;
          case ENTITY_NAME.GROUP_STATE:
            return mockState;
        }
      });

      expect(viewModel['_getSingleUnreadInfo']()).toEqual({
        unreadCount: 12,
        important: true,
      });
    });
  });
});
