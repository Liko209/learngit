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
jest.mock('../../../../../store/utils');

let ViewModel: MoreViewModel;
const mockGlobalValue = {
  [GLOBAL_KEYS.CURRENT_USER_ID]: 1,
};

describe('MoreVM', () => {
  describe('permissionsMap()', () => {
    beforeAll(() => {
      jest.resetAllMocks();
    });
    it('should display Quote option on more actions in Group [JPT-443]', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { isTeam: false };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1 };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE]).toBe(true);
    });

    it('should display Quote option on more actions in Team with admin permission [JPT-443]', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { isTeam: true, isThePersonAdmin: () => true };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1 };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE]).toBe(true);
    });

    it('should display Quote option on more actions in Team with user permission [JPT-443]', () => {
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return {
            isTeam: true,
            isThePersonAdmin: () => false,
            permission: { user: { level: 1 } },
          };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1 };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.QUOTE]).toBe(true);
    });

    it('should display Delete option on more actions with post by me condition [JPT-482]', () => {
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        return mockGlobalValue[key];
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { isTeam: false };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1 };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.DELETE]).toBe(true);
    });

    it('should do not display Delete option on more actions with post by me condition [JPT-482]', () => {
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        return mockGlobalValue[key];
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { isTeam: false };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 2 };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.DELETE]).toBe(false);
    });

    it('should display Edit post option on more actions with post by me condition in Group', () => {
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        return mockGlobalValue[key];
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { isTeam: false };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1 };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT]).toBe(true);
    });

    it('should display Edit post option on more actions with post by me condition and admin permission in Team', () => {
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        return mockGlobalValue[key];
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return { isTeam: true, isThePersonAdmin: () => true };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1 };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT]).toBe(true);
    });

    it('should display Edit post option on more actions with post by me condition and user permission in Team', () => {
      (getGlobalValue as jest.Mock).mockImplementation((key: GLOBAL_KEYS) => {
        return mockGlobalValue[key];
      });
      (getEntity as jest.Mock).mockImplementation((type: string) => {
        if (type === ENTITY_NAME.GROUP) {
          return {
            isTeam: true,
            isThePersonAdmin: () => false,
            permission: { user: { level: 1 } },
          };
        }
        if (type === ENTITY_NAME.POST) {
          return { creatorId: 1 };
        }
        return null;
      });
      ViewModel = new MoreViewModel({ id: 1 });

      expect(ViewModel.permissionsMap[MENU_LIST_ITEM_TYPE.EDIT]).toBe(true);
    });
  });
});
