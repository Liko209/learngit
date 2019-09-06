/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-06-05 21:22:30
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockEntity } from 'shield/application/mockEntity';
import { mockService } from 'shield/sdk/mockService';
import { FileDeleteActionViewModel } from '../FileDeleteAction.ViewModel';
import { ItemService } from 'sdk/module/item/service';
import { ENTITY_NAME } from '@/store';
import {
  JServerError,
  JNetworkError,
  ERROR_CODES_SERVER,
  ERROR_CODES_NETWORK,
} from 'sdk/error';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { Notification } from '@/containers/Notification';
import { getGlobalValue } from '@/store/utils';

jest.mock('@/containers/Notification');

const userA = 'userA';
const userB = 'userB';
const userC = 'userC';
const fileV1 = {
  creator_id: userA,
};
const fileV2 = {
  creator_id: userB,
};
const fileV3 = {
  creator_id: userC,
};

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

describe('FileDeleteActionViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  const entityMock = ({ postFileVersion, isThePersonGuest }) => (name: any) => {
    if (name === ENTITY_NAME.POST) {
      if (postFileVersion) {
        return {
          fileItemVersion: () => postFileVersion,
        };
      }
      return null;
    }
    if (name === ENTITY_NAME.ITEM) {
      return {
        creatorId: userA,
        latestVersion: fileV3,
        versions: [fileV3, fileV2, fileV1],
      };
    }
    if (name === ENTITY_NAME.GROUP) {
      return {
        isThePersonGuest: () => {
          return isThePersonGuest;
        },
      };
    }
  };

  @testable
  class canDelete {
    @test(
      'should be true when file is in conversation and fileVersion in post is uploaded by user',
    )
    @mockEntity(entityMock({ postFileVersion: 3, isThePersonGuest: false }))
    t1() {
      // @ts-ignore
      getGlobalValue = jest.fn().mockReturnValue(userC);
      const vm = new FileDeleteActionViewModel({ postId: 123 });
      expect(vm.canDelete).toBe(true);
    }

    @test(
      'should be false when file is in conversation and fileVersion in post is not uploaded by user',
    )
    @mockEntity(entityMock({ postFileVersion: 1, isThePersonGuest: false }))
    t2() {
      getGlobalValue = jest.fn().mockReturnValue(userC);
      const vm = new FileDeleteActionViewModel({ postId: 123 });
      expect(vm.canDelete).toBe(false);
    }

    @test(
      'should be true when file is not conversation and latest file version is uploaded by user',
    )
    @mockEntity(entityMock({}))
    t3() {
      // @ts-ignore
      getGlobalValue = jest.fn().mockReturnValue(userC);
      const vm = new FileDeleteActionViewModel();
      expect(vm.canDelete).toBe(true);
    }

    @test(
      'should be false when file is not conversation and latest file version is not uploaded by user',
    )
    @mockEntity(entityMock({}))
    t4() {
      // @ts-ignore
      getGlobalValue = jest.fn().mockReturnValue(userB);
      const vm = new FileDeleteActionViewModel();
      expect(vm.canDelete).toBe(false);
    }

    @test(
      'should be true when file is in conversation and fileVersion in post is uploaded by user, but the user is a guest',
    )
    @mockEntity(entityMock({ postFileVersion: 3, isThePersonGuest: true }))
    t5() {
      // @ts-ignore
      getGlobalValue = jest.fn().mockReturnValue(userC);
      const vm = new FileDeleteActionViewModel();
      expect(vm.canDelete).toBe(true);
    }
  }

  const spy = jest.fn();
  const t2Spy = jest.fn();
  @testable
  class handleDeleteFile {
    @test(
      'should delete the version that currentUser uploaded when in conversation',
    )
    @mockService(ItemService, 'deleteFile', spy)
    @mockEntity(entityMock({ postFileVersion: 1, isThePersonGuest: false }))
    t1() {
      const vm = new FileDeleteActionViewModel({
        postId: 123,
        fileId: 123,
      });
      vm.handleDeleteFile();
      expect(spy).toHaveBeenCalledWith(123, 1);
    }

    @test('should delete the latest version when not in conversation')
    @mockService(ItemService, 'deleteFile', t2Spy)
    @mockEntity(entityMock({}))
    t2() {
      const vm = new FileDeleteActionViewModel({
        postId: 123,
        fileId: 123,
      });
      vm.handleDeleteFile();
      expect(t2Spy).toHaveBeenCalledWith(123, 3);
    }
  }

  @testable
  class errorHandler {
    @test('should show toast when backend error happen [JPT-2048]')
    @mockService(ItemService, 'deleteFile', () => {
      throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
    })
    @mockEntity(entityMock({}))
    async t1() {
      Notification.flashToast = jest.fn();
      const vm = new FileDeleteActionViewModel({
        fileId: 123,
      });
      await vm.handleDeleteFile();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('message.prompt.deleteFileBackendError'),
      );
    }

    @test('should show toast when network error happen [JPT-2044]')
    @mockService(ItemService, 'deleteFile', () => {
      throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
    })
    @mockEntity(entityMock({}))
    async t2() {
      Notification.flashToast = jest.fn();
      const vm = new FileDeleteActionViewModel({
        fileId: 123,
      });
      await vm.handleDeleteFile();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('message.prompt.deleteFileNetworkError'),
      );
    }
  }
});
