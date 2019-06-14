/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-12 14:08:17
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockSingleEntity, mockEntity } from 'shield/application';
import { ProfileService } from 'sdk/module/profile';
import { mockService } from 'shield/sdk';
import { MenuViewModel } from '../Menu.ViewModel';
import * as utils from '@/store/utils';
import storeManager from '@/store/base/StoreManager';
import { GLOBAL_KEYS } from '@/store/constants';
import { ServiceConfig } from 'sdk/module/serviceLoader';

describe('TestMenuViewModel', () => {
  function createGroupState(groupState?: any) {
    return {
      unreadCount: 0,
      isFavorite: false,
      ...groupState,
    };
  }

  function createGroup(group?: any) {
    return {
      mostRecentPostId: undefined,
      ...group,
    };
  }

  const stateService = {
    name: ServiceConfig.STATE_SERVICE,
    updateReadStatus() {},
  };

  @testable
  class shouldSkipCloseConfirmation {
    @test('should be return falsy if shouldSkipCloseConfirmation as default')
    @mockSingleEntity(false)
    t1() {
      const model = new MenuViewModel();
      expect(model.shouldSkipCloseConfirmation).toBeFalsy();
    }
  }

  @testable
  class testProps {
    @test('should current props if pass props to view model')
    t1() {
      const props = {
        groupId: 2,
        anchorEl: null,
        onClose: () => {},
      };
      const model = new MenuViewModel(props);
      expect(model.groupId).toBe(2);
      expect(model.onClose).toBeInstanceOf(Function);
      expect(model.anchorEl).toBe(null);
    }
  }

  @testable
  class closable {
    @test('should closable when conversation is neither unread nor favourite')
    @mockEntity(createGroupState())
    t1() {
      const model = new MenuViewModel();
      expect(model.closable).toBe(true);
    }

    @test('should not closable when conversation is both unread and favourite')
    @mockEntity(createGroupState({ unreadCount: 100, isFavorite: true }))
    t2() {
      const model = new MenuViewModel();
      expect(model.closable).toBe(false);
    }

    @test('should not closable when conversation is unread')
    @mockEntity(createGroupState({ unreadCount: 100 }))
    t3() {
      const model = new MenuViewModel();
      expect(model.closable).toBe(false);
    }

    @test('should not closable when conversation is favourite')
    @mockEntity(createGroupState({ isFavorite: true }))
    t4() {
      const model = new MenuViewModel();
      expect(model.closable).toBe(false);
    }
  }

  @testable
  class favoriteText {
    @test('should favoriteText correctly when isFavorite=true')
    @mockEntity(createGroupState({ isFavorite: true }))
    t1() {
      const model = new MenuViewModel();
      expect(model.favoriteText).toBe('people.team.removeFromFavorites');
    }
    @test('should favoriteText correctly when isFavorite=false')
    @mockEntity(createGroupState({ isFavorite: false }))
    t2() {
      const model = new MenuViewModel();
      expect(model.favoriteText).toBe('people.team.favorite');
    }
  }

  @testable
  class isUnread {
    @test('should be true when conversation has unread post [JPT-1270]')
    @mockEntity(createGroupState({ unreadCount: 10 }))
    t1() {
      const model = new MenuViewModel();
      expect(model.isUnread).toBe(true);
    }

    @test('should be false when conversation has not unread post [JPT-1271]')
    @mockEntity(createGroupState({ unreadCount: 0 }))
    t2() {
      const model = new MenuViewModel();
      expect(model.isUnread).toBe(false);
    }
  }

  @testable
  class disabledReadOrUnread {
    @test('should be true when conversation has unread post [JPT-1270]')
    @mockEntity(createGroup({ mostRecentPostId: undefined }))
    t1() {
      const model = new MenuViewModel();
      expect(model.disabledReadOrUnread).toBe(true);
    }

    @test('should be false when conversation has not unread post [JPT-1271]')
    @mockEntity({ mostRecentPostId: 1 })
    t2() {
      const model = new MenuViewModel();
      expect(model.disabledReadOrUnread).toBe(false);
    }
  }

  @testable
  class toggleRead {
    @test(
      'should be call service interface is one time when invoke vm toggleRead method [JPT-1282]',
    )
    @mockEntity(createGroup())
    @mockService(stateService, 'updateReadStatus')
    async t1() {
      const model = new MenuViewModel({
        groupId: 1,
        anchorEl: null,
        onClose: () => {},
      });
      storeManager.getGlobalStore().set(GLOBAL_KEYS.CURRENT_CONVERSATION_ID, 1);
      await model.toggleRead();
      expect(utils.getGlobalValue(GLOBAL_KEYS.SHOULD_SHOW_UMI)).toBe(true);
      expect(stateService.updateReadStatus).toHaveBeenCalledTimes(1);
    }
  }

  const mockToggleFavorite = jest.fn();

  @testable
  class toggleFavorite {
    @test('should isFavorite be update when toggle favorite.')
    @mockService(ProfileService, 'markGroupAsFavorite', mockToggleFavorite)
    @mockEntity(createGroup({ isFavorite: false }))
    t1() {
      const model = new MenuViewModel({
        groupId: 1,
        anchorEl: null,
        onClose: () => {},
      });

      model.toggleFavorite();

      expect(mockToggleFavorite).toHaveBeenCalledWith(1, true);
    }
  }

  const mockHideConversation = jest.fn();

  @testable
  class closeConversation {
    @test('should skip next time be update when close conversation .')
    @mockService(ProfileService, 'hideConversation', mockHideConversation)
    t1() {
      const model = new MenuViewModel({
        groupId: 1,
        anchorEl: null,
        onClose: () => {},
      });

      model.closeConversation(true);

      expect(mockHideConversation).toHaveBeenCalledWith(1, true, true);
    }
  }
});
