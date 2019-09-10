/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 13:29:53
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '@/store/utils';
import { MoreViewModel } from '../More.ViewModel';
import { MENU_LIST_ITEM_TYPE } from '../types';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { TypeDictionary } from 'sdk/utils';
jest.mock('@/store/utils');
jest.mock('sdk/utils');

let ViewModel: MoreViewModel;

const mockGlobalValue = (mockValue: {
  currentUserId?: number;
  groupId?: number;
}) => {
  const { currentUserId, groupId } = mockValue;

  (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
    if (key === GLOBAL_KEYS.CURRENT_CONVERSATION_ID) {
      return groupId;
    }

    if (key === GLOBAL_KEYS.CURRENT_USER_ID) {
      return currentUserId;
    }
    return null;
  });
};

const mockGetEntity = (mockEntity: { group?: any; post?: any }) => {
  const { group, post = { creatorId: 1 } } = mockEntity;

  (getEntity as jest.Mock).mockImplementation((type: string) => {
    if (type === ENTITY_NAME.GROUP) {
      return group;
    }
    if (type === ENTITY_NAME.POST) {
      return post;
    }
    return null;
  });
};

describe('MoreVM', () => {
  describe('permissionsMap for quote', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should display Quote option on more actions except task or event post in Group or Team [JPT-443, JPT-514, JPT-535]', () => {
      mockGetEntity({
        group: {
          canPost: true,
        },
        post: { itemTypeIds: {}, id: 1 },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE].shouldShowAction,
      ).toBe(true);
    });

    it('should not display Quote option on more actions in task post type in Group or Team [JPT-443, JPT-514, JPT-535]', () => {
      mockGetEntity({
        group: {
          canPost: true,
        },
        post: { itemTypeIds: { [TypeDictionary.TYPE_ID_TASK]: [1] }, id: 1 },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE].shouldShowAction,
      ).toBe(false);
    });

    it('should not display Quote option on more actions in event post type in Group or Team [JPT-443, JPT-514, JPT-535]', () => {
      mockGetEntity({
        group: {
          canPost: true,
        },
        post: { itemTypeIds: { [TypeDictionary.TYPE_ID_EVENT]: [1] }, id: 1 },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE].shouldShowAction,
      ).toBe(false);
    });

    it('should able Quote option on more actions in Group or Team with can post permission and exclude in bookmarks or mentions page [JPT-443, JPT-513]', () => {
      mockGetEntity({
        group: {
          canPost: true,
        },
      });
      mockGlobalValue({ currentUserId: 1, groupId: 1 });

      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE].permission,
      ).toBe(true);
    });

    it('should disable Quote option on more actions in Group or Team with cannot post permission [JPT-443]', () => {
      mockGetEntity({
        group: {
          canPost: false,
        },
      });
      mockGlobalValue({ currentUserId: 1, groupId: 1 });

      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE].permission,
      ).toBe(false);
    });

    it('should disable Quote option on more actions in Group or Team with can post permission in bookmarks or mentions page [JPT-443, JPT-513]', () => {
      mockGetEntity({
        group: {
          canPost: true,
        },
      });
      mockGlobalValue({ currentUserId: 1, groupId: 0 });

      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE].permission,
      ).toBe(false);
    });
  });

  describe('permissionsMap for delete', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should display Delete option on more actions with post by me condition [JPT-466]', () => {
      mockGlobalValue({ currentUserId: 1 });
      mockGetEntity({
        group: {
          canPost: true,
        },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.DELETE].permission,
      ).toBe(true);
    });

    it('should disable Delete option on more actions with post by me condition [JPT-466]', () => {
      mockGlobalValue({ currentUserId: 1 });
      mockGetEntity({
        group: {
          canPost: true,
        },
        post: {
          creatorId: 2,
          id: 1,
        },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.DELETE].permission,
      ).toBe(false);
    });
  });

  describe('permissionsMap for edit', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should display Edit option on more actions except task or event post in Group or Team [JPT-514, JPT-535]', () => {
      mockGetEntity({
        group: {
          canPost: true,
        },
        post: { itemTypeIds: {}, id: 1 },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT].shouldShowAction,
      ).toBe(true);
    });

    it('should not display Edit option on more actions in task post type in Group or Team [JPT-514, JPT-535]', () => {
      mockGetEntity({
        group: {
          canPost: true,
        },
        post: { itemTypeIds: { [TypeDictionary.TYPE_ID_TASK]: [1] }, id: 1 },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT].shouldShowAction,
      ).toBe(false);
    });

    it('should not display Edit option on more actions in event post type in Group or Team [JPT-514, JPT-535]', () => {
      mockGetEntity({
        group: {
          canPost: true,
        },
        post: { itemTypeIds: { [TypeDictionary.TYPE_ID_EVENT]: [1] }, id: 1 },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT].shouldShowAction,
      ).toBe(false);
    });

    it('should display Edit post option on more actions with post by me condition and can post permission in Group or Team [JPT-477]', () => {
      mockGlobalValue({ currentUserId: 1 });
      mockGetEntity({
        group: {
          canPost: true,
        },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT].permission,
      ).toBe(true);
    });

    it('should display Edit post option on more actions with not post by me condition and can post permission in Group or Team [JPT-477]', () => {
      mockGlobalValue({ currentUserId: 1 });
      mockGetEntity({
        group: {
          canPost: true,
        },
        post: {
          creatorId: 2,
          id: 1,
        },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT].permission,
      ).toBe(false);
    });

    it('should disable Edit option on more actions in Group or Team with cannot post permission [JPT-477]', () => {
      mockGetEntity({
        group: {
          canPost: false,
        },
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE].permission,
      ).toBe(false);
    });

    it('should not show more action when post only have files', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.POST) {
          return { itemIds: [1] };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.showMoreAction).toBe(false);
    });
  });

  describe('showMoreAction()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should show quote & delete & edit action buttons [JPT-440, JPT-475, JPT-482, JPT-472]', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.POST) {
          return { text: 'test' };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.showMoreAction).toBe(true);
    });

    it('should not show quote & delete & edit action buttons on task post', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.POST) {
          return {
            text: 'test',
            itemTypeIds: { [TypeDictionary.TYPE_ID_TASK]: [1] },
          };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.showMoreAction).toBe(false);
    });

    it('should not show quote & delete & edit action buttons on event post', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.POST) {
          return {
            text: 'test',
            itemTypeIds: { [TypeDictionary.TYPE_ID_EVENT]: [1] },
          };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.showMoreAction).toBe(false);
    });
  });
});
