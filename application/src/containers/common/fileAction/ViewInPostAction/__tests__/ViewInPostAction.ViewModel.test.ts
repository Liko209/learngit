/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-06-30 16:24:52
 * Copyright © RingCentral. All rights reserved.
 */
import portalManager from '@/common/PortalManager';
import { jumpToPost } from '@/common/jumpToPost';
jest.mock('@/common/PortalManager');
jest.mock('@/common/jumpToPost');
import { test, testable } from 'shield';
import { mockService } from 'shield/sdk';
import { PostService } from 'sdk/module/post';
import { ViewInPostActionViewModel } from '../ViewInPostAction.ViewModel';

describe('ViewInPostAction.ViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  @testable
  class viewInPost {
    @test(
      'should call portalManager.dismissAll() than call jumpToPost when found post',
    )
    @mockService(PostService, 'getLatestPostIdByItem', () => 1)
    async t1(done: any) {
      portalManager.dismissAll = jest.fn();
      const vm = new ViewInPostActionViewModel({
        groupId: 123,
        fileId: 1,
      });
      vm.viewInPost();
      setImmediate(() => {
        expect(portalManager.dismissAll).toBeCalled();
        expect(jumpToPost).toBeCalled();
        done();
      });
    }

    @test('should not jumpToPost when cant find corresponding post')
    @mockService(PostService, 'getLatestPostIdByItem', () => null)
    async t2(done: any) {
      portalManager.dismissAll = jest.fn();
      const vm = new ViewInPostActionViewModel({
        groupId: 123,
        fileId: 1,
      });
      vm.viewInPost();
      setImmediate(() => {
        expect(portalManager.dismissAll).not.toBeCalled();
        expect(jumpToPost).not.toBeCalled();
        done();
      });
    }
  }
});
