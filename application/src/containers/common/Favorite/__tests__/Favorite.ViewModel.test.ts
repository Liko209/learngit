/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-27 15:22:58
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockEntity, mockGlobalValue } from 'shield/application';
import { mockService } from 'shield/sdk';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { FavoriteViewModel } from '../Favorite.ViewModel';

describe.skip('FavoriteViewModel', () => {
  const initId = 11370502; // Note: Make sure that each instance is created the same
  const groupService = {
    name: ServiceConfig.GROUP_SERVICE,
    getLocalGroup() {},
  };

  const profileService = {
    name: ServiceConfig.PROFILE_SERVICE,
    markGroupAsFavorite() {},
  };

  @testable
  class getConversationId {
    @test('should be direct return a conversation id when it is the team id')
    t1() {
      const vm = new FavoriteViewModel({ id: 2031622 }); // team id
      expect(vm.conversationId).toBe(2031622);
    }

    @test('should be direct return a conversation id when it is the team id')
    t2() {
      const vm = new FavoriteViewModel({ id: 18751490 }); // group id
      expect(vm.conversationId).toBe(18751490);
    }

    @test(
      'should be from service fetch a conversation id when it is the person id',
    )
    @mockService(groupService, 'getLocalGroup', { id: 11370502 })
    async t3() {
      const vm = new FavoriteViewModel({ id: 237571 }); // person id
      await vm.getConversationId();
      expect(vm.conversationId).toBe(11370502);
    }

    @test(
      'should be not available conversation id when it is the person id and 1:1 talk was never created',
    )
    @mockService.resolve(groupService, 'getLocalGroup', undefined)
    async t4() {
      const vm = new FavoriteViewModel({ id: 237571 }); // person id
      await vm.getConversationId();
      expect(vm.conversationId).toBe(0);
    }

    @test('should be undefined when other type id props are passed in')
    t5() {
      const vm = new FavoriteViewModel({ id: 1 }); // person id
      expect(vm.conversationId).toBeUndefined();
    }
  }

  @testable
  class isFavorite {
    @test('should be true when favorite group')
    @mockEntity({ isFavorite: true })
    t1() {
      const vm = new FavoriteViewModel({ id: initId });
      expect(vm.isFavorite).toEqual(true);
    }

    @test('should be false when not favorite group')
    @mockEntity({ isFavorite: false })
    t2() {
      const vm = new FavoriteViewModel({ id: initId });
      expect(vm.isFavorite).toEqual(false);
    }

    @test('should be false when other type id props are passed in')
    t3() {
      const vm = new FavoriteViewModel({ id: 1 }); // other type id
      expect(vm.isFavorite).toEqual(false);
    }
  }

  @testable
  class isMemeber {
    @test('should be true when current user id in group')
    @mockEntity({ members: [1, 2, 3] })
    @mockGlobalValue(1)
    t1() {
      const vm = new FavoriteViewModel({ id: initId });
      expect(vm.isMember).toBe(true);
    }

    @test('should be false when current user id not in group')
    @mockEntity({ members: [2, 3] })
    t2() {
      const vm = new FavoriteViewModel({ id: initId });
      expect(vm.isMember).toBe(false);
    }

    @test('should be false when other type id props are passed in')
    @mockEntity({ members: [1, 2, 3] })
    t3() {
      const vm = new FavoriteViewModel({ id: 1 });
      expect(vm.isMember).toBe(false);
    }
  }

  @testable
  class handlerFavorite {
    @test(
      'should be success when request service for handler favorite is success',
    )
    @mockService.resolve(
      profileService,
      'markGroupAsFavorite',
      ServiceCommonErrorType.NONE,
    )
    async t1() {
      const vm = new FavoriteViewModel({ id: initId });
      const result = await vm.handlerFavorite();
      expect(result).toEqual(ServiceCommonErrorType.NONE);
    }

    @test(
      'should be throw a error when request service for handler favorite has error',
    )
    @mockService.resolve(
      profileService,
      'markGroupAsFavorite',
      ServiceCommonErrorType.SERVER_ERROR,
    )
    async t2() {
      const vm = new FavoriteViewModel({ id: initId });
      const result = await vm.handlerFavorite();
      expect(result).toEqual(ServiceCommonErrorType.SERVER_ERROR);
    }
  }
});
