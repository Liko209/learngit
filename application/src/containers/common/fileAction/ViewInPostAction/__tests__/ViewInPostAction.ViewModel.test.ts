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
import { mockEntity } from 'shield/application';
import { ViewInPostActionViewModel } from '../ViewInPostAction.ViewModel';
import {
  JServerError,
  JNetworkError,
  ERROR_CODES_SERVER,
  ERROR_CODES_NETWORK,
} from 'sdk/error';
import { Notification } from '@/containers/Notification';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';

jest.mock('@/containers/Notification');

function toastParamsBuilder(message: string) {
  return {
    message,
    type: ToastType.ERROR,
    messageAlign: ToastMessageAlign.LEFT,
    fullWidth: false,
    dismissible: false,
    autoHideDuration: 3000,
  };
}

describe('ViewInPostAction.ViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  @testable
  class viewInPost {
    @test(
      'should call portalManager.dismissAll() than call jumpToPost when found post',
    )
    @mockEntity({ getDirectRelatedPostInGroup: () => 123 })
    async t1(done: any) {
      portalManager.dismissAll = jest.fn();
      const vm = new ViewInPostActionViewModel({
        groupId: 123,
        fileId: 1,
        asyncOperationDecorator: (x: any) => x,
      });
      vm.viewInPost();
      setImmediate(() => {
        expect(portalManager.dismissAll).toBeCalled();
        expect(jumpToPost).toBeCalled();
        done();
      });
    }

    @test('should not jumpToPost when cant find corresponding post')
    @mockEntity({ getDirectRelatedPostInGroup: () => null })
    async t2(done: any) {
      portalManager.dismissAll = jest.fn();
      const vm = new ViewInPostActionViewModel({
        groupId: 123,
        fileId: 1,
        asyncOperationDecorator: x => x,
      });
      vm.viewInPost();
      setImmediate(() => {
        expect(portalManager.dismissAll).not.toBeCalled();
        expect(jumpToPost).not.toBeCalled();
        done();
      });
    }
  }

  @testable
  class errorHandler {
    @test('should show toast when backend error happen')
    @mockEntity({
      getDirectRelatedPostInGroup: () => {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      },
    })
    async t1(done) {
      Notification.flashToast = jest.fn();
      const vm = new ViewInPostActionViewModel({
        fileId: 123,
        groupId: 123,
        asyncOperationDecorator: x => x,
      } as any);
      await vm.viewInPost();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('message.prompt.viewInPostFailedWithServerIssue'),
      );
      done();
    }

    @test('should show toast when network error happen [JPT-2044]')
    @mockEntity({
      getDirectRelatedPostInGroup: () => {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
      },
    })
    async t2(done) {
      Notification.flashToast = jest.fn();
      const vm = new ViewInPostActionViewModel({
        fileId: 123,
        groupId: 123,
        asyncOperationDecorator: x => x,
      } as any);
      await vm.viewInPost();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('message.prompt.viewInPostFailedWithNetworkIssue'),
      );
      done();
    }
  }
});
