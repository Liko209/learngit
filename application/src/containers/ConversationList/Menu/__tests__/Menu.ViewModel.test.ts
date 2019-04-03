/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-12 14:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import { MenuViewModel } from '../Menu.ViewModel';
import * as utils from '@/store/utils';
import storeManager from '@/store/base/StoreManager';
import { GLOBAL_KEYS } from '@/store/constants';
import { StateService } from 'sdk/module/state';

jest.mock('sdk/service');
jest.mock('sdk/api');

const stateService = {
  updateReadStatus: jest.fn(),
};
StateService.getInstance = jest.fn().mockReturnValue(stateService);

describe('MenuViewModel', () => {
  describe('shouldSkipCloseConfirmation()', () => {
    it('should return falsy for shouldSkipCloseConfirmation as default', () => {
      jest.spyOn(utils, 'getSingleEntity').mockImplementationOnce(() => false);
      const model = new MenuViewModel();
      expect(model.shouldSkipCloseConfirmation).toBeFalsy();
    });
  });

  describe('test props', () => {
    it('should test props for view model', () => {
      const props = {
        personId: 1,
        groupId: 2,
        anchorEl: null,
        onClose: () => {},
      };
      const model = new MenuViewModel(props);
      expect(model.personId).toBe(1);
      expect(model.groupId).toBe(2);
      expect(model.onClose).toBeInstanceOf(Function);
      expect(model.anchorEl).toBe(null);
    });
  });

  describe('closable()', () => {
    let groupState: any;
    beforeEach(() => {
      groupState = {
        unreadCount: 0,
        isFavorite: false,
      };
      jest.clearAllMocks();
      jest.spyOn(utils, 'getEntity').mockImplementation(() => groupState);
    });
    it('should closable when conversation is neither unread nor favourite', () => {
      const model = new MenuViewModel();
      expect(model.closable).toBe(true);
    });
    it('should not closable when conversation is both unread and favourite', () => {
      const model = new MenuViewModel();
      groupState.unreadCount = 100;
      groupState.isFavorite = true;
      expect(model.closable).toBe(false);
    });
    it('should not closable when conversation is unread ', () => {
      const model = new MenuViewModel();
      groupState.unreadCount = 100;
      expect(model.closable).toBe(false);
    });
    it('should not closable when conversation is favourite', () => {
      const model = new MenuViewModel();
      groupState.isFavorite = true;
      expect(model.closable).toBe(false);
    });
  });
  describe('favoriteText()', () => {
    let groupState: any;
    beforeEach(() => {
      groupState = {
        unreadCount: 0,
        isFavorite: false,
      };
      jest.clearAllMocks();
      jest.spyOn(utils, 'getEntity').mockImplementation(() => groupState);
    });
    it('should favoriteText correctly when isFavorite=true', () => {
      const model = new MenuViewModel();
      groupState.isFavorite = true;
      expect(model.favoriteText).toBe('people.team.removeFromFavorites');
    });
    it('should favoriteText correctly when isFavorite=false', () => {
      const model = new MenuViewModel();
      groupState.isFavorite = false;
      expect(model.favoriteText).toBe('people.team.favorite');
    });
  });

  describe('isUnread', () => {
    let groupState: any;
    beforeEach(() => {
      groupState = {
        unreadCount: 0,
      };
      jest.clearAllMocks();
      jest.spyOn(utils, 'getEntity').mockImplementation(() => groupState);
    });
    it('should be true when conversation has unread post [JPT-1270]', () => {
      const model = new MenuViewModel();
      groupState.unreadCount = 10;
      expect(model.isUnread).toBe(true);
    });
    it('should be false when conversation has not unread post [JPT-1271]', () => {
      const model = new MenuViewModel();
      groupState.unreadCount = 0;
      expect(model.isUnread).toBe(false);
    });
  });

  describe('disabledReadOrUnread', () => {
    let group: any;
    beforeEach(() => {
      group = {
        mostRecentPostId: undefined,
      };
      jest.clearAllMocks();
      jest.spyOn(utils, 'getEntity').mockImplementation(() => group);
    });
    it('should be true when conversation not post or network is offline [JPT-1269]', () => {
      const model = new MenuViewModel();
      group.mostRecentPostId = undefined;
      expect(model.disabledReadOrUnread).toBe(true);
    });
    it('should be false when conversation has post and network is online [JPT-1269]', () => {
      const model = new MenuViewModel();
      group.mostRecentPostId = 1;
      expect(model.disabledReadOrUnread).toBe(false);
    });
  });

  describe('toggleRead()', () => {
    let group: any;
    beforeEach(() => {
      group = {
        unreadCount: undefined,
      };
      jest.clearAllMocks();
      jest.spyOn(utils, 'getEntity').mockImplementation(() => group);
    });

    it('should be call service interface is one time when invoke vm toggleRead method [JPT-1282]', async () => {
      const model = new MenuViewModel({
        groupId: 1,
        personId: 2,
        anchorEl: null,
        onClose: () => {},
      });
      storeManager.getGlobalStore().set(GLOBAL_KEYS.CURRENT_CONVERSATION_ID, 1);
      await model.toggleRead();
      expect(utils.getGlobalValue(GLOBAL_KEYS.SHOULD_SHOW_UMI)).toBe(true);
      expect(stateService.updateReadStatus).toHaveBeenCalledTimes(1);
    });
  });
});
