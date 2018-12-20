/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 13:29:53
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '../../../../../store/utils';
import { MoreViewModel } from '../More.ViewModel';
import { MENU_LIST_ITEM_TYPE } from '../types';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { TypeDictionary } from 'sdk/utils';
jest.mock('../../../../../store/utils');
jest.mock('sdk/utils');

let ViewModel: MoreViewModel;
const mockGlobalValue = {
  [GLOBAL_KEYS.CURRENT_USER_ID]: 1,
};

describe('MoreVM', () => {
  describe('permissionsMap for quote', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should display Quote option on more actions in Group [JPT-443]', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { canPost: true };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1, text: 'a' };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE].permission,
      ).toBe(true);
    });

    it('should disable Quote option on more actions in Team with user permission [JPT-443]', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return {
            canPost: false,
          };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1 };
        }
        return null;
      });
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
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        return mockGlobalValue[key];
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { canPost: true };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1 };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.DELETE].permission,
      ).toBe(true);
    });

    it('should disable Delete option on more actions with post by me condition [JPT-466]', () => {
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        return mockGlobalValue[key];
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { canPost: true };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 2 };
        }
        return null;
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
    it('should display Edit post option on more actions with post by me condition in Group [JPT-477]', () => {
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        return mockGlobalValue[key];
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { canPost: true, text: 'a' };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1, text: 'a' };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT].permission,
      ).toBe(true);
    });

    it('should display Edit post option on more actions with post by me condition and admin permission in Team [JPT-477]', () => {
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        return mockGlobalValue[key];
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { canPost: true, text: 'a' };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1, text: 'a' };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT].permission,
      ).toBe(true);
    });

    it('should display Edit post option on more actions with post by me condition and user permission in Team [JPT-477]', () => {
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        return mockGlobalValue[key];
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { canPost: true, text: 'a' };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1, text: 'a' };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT].permission,
      ).toBe(true);
    });

    it('should disable Edit option on more actions in Team with user permission [JPT-477]', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { canPost: false };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1 };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(
        ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE].permission,
      ).toBe(false);
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

    it('should show more action when post only have files', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.POST) {
          return { itemIds: [1] };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.showMoreAction).toBe(true);
    });
  });

  describe('_excludeBookmarksOrMentionsPage()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should disable quote option for posts on Bookmarks/Mentions page [JPT-513]', () => {
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        if (key === GLOBAL_KEYS.CURRENT_CONVERSATION_ID) {
          return 0;
        }

        if (key === GLOBAL_KEYS.CURRENT_USER_ID) {
          return mockGlobalValue[key];
        }
        return null;
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.POST) {
          return { text: 'test' };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel._excludeBookmarksOrMentionsPage).toBe(false);
    });
  });
  describe('_isEventOrTask()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should not show quote action button in task [JPT-514]', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.POST) {
          return { itemTypeIds: { [TypeDictionary.TYPE_ID_TASK]: [1] } };
        }
        return null;
      });

      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel._isEventOrTask).toBe(true);
    });

    it('should not show quote action button in event [JPT-514]', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.POST) {
          return { itemTypeIds: { [TypeDictionary.TYPE_ID_EVENT]: [1] } };
        }
        return null;
      });

      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel._isEventOrTask).toBe(true);
    });
  });
});
