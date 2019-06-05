/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-06-05 21:22:30
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { FileDeleteActionViewModel } from '../FileDeleteAction.ViewModel';
import { AccountService } from 'sdk/module/account';
import { ENTITY_NAME } from '@/store';

const userA = 'userA';
const userB = 'userB';
const userC = 'userC';
describe('FileDeleteActionViewModel', () => {
  const entityMock = postFileVersion => (name: any) => {
    if (name === ENTITY_NAME.POST) {
      if (postFileVersion) {
        return {
          fileItemVersion: () => postFileVersion,
        };
      }
      return null;
    }
    if ((name = ENTITY_NAME.ITEM)) {
      return {
        creatorId: userA,
        latestVersion: { creator_id: userC },
        versions: [
          {
            creator_id: userC,
          },
          {
            creator_id: userB,
          },
          {
            creator_id: userA,
          },
        ],
      };
    }
  };

  const mockUserConfig = userId => () => {
    return {
      getGlipUserId() {
        return userId;
      },
    };
  };

  @testable
  class canDelete {
    @test(
      'should be true when file is in conversation and fileVersion in post is uploaded by user',
    )
    @mockService(AccountService, 'userConfig.get', mockUserConfig(userC))
    @mockEntity(entityMock(3))
    t1() {
      const vm = new FileDeleteActionViewModel({ postId: 123 } as any);
      expect(vm.canDelete).toBe(true);
    }

    @test(
      'should be false when file is in conversation and fileVersion in post is not uploaded by user',
    )
    @mockService(AccountService, 'userConfig.get', mockUserConfig(userC))
    @mockEntity(entityMock(1))
    t2() {
      const vm = new FileDeleteActionViewModel({ postId: 123 } as any);
      expect(vm.canDelete).toBe(false);
    }

    @test(
      'should be true when file is not conversation and latest file version is uploaded by user',
    )
    @mockService(AccountService, 'userConfig.get', mockUserConfig(userC))
    @mockEntity(entityMock(undefined))
    t3() {
      const vm = new FileDeleteActionViewModel({ postId: 123 } as any);
      expect(vm.canDelete).toBe(true);
    }

    @test(
      'should be false when file is not conversation and latest file version is not uploaded by user',
    )
    @mockService(AccountService, 'userConfig.get', mockUserConfig(userB))
    @mockEntity(entityMock(undefined))
    t4() {
      const vm = new FileDeleteActionViewModel({ postId: 123 } as any);
      expect(vm.canDelete).toBe(false);
    }
  }
});
