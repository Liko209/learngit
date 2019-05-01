/// <reference path="../../../../../__tests__/types.d.ts" />
/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-15 11:17:32
 * Copyright © RingCentral. All rights reserved.
 */
import {
  localPostJson4UnitTest,
  serverPostJson4UnitTest,
} from '../__tests__/PostData';
import { SendPostController } from '../SendPostController';
import { PostActionController } from '../PostActionController';

import { GroupConfigService } from '../../../../groupConfig';

import _ from 'lodash';
import { IPreInsertController } from '../../../../common/controller/interface/IPreInsertController';
import { Post } from '../../../entity/Post';
import { daoManager, AccountDao } from '../../../../../dao';
import { PostDao } from '../../../dao/PostDao';
import notificationCenter from '../../../../../service/notificationCenter';
import { ExtendedBaseModel } from '../../../../models';
import { PROGRESS_STATUS } from '../../../../progress';
import { GlobalConfigService } from '../../../../../module/config';
import { AccountUserConfig } from '../../../../../module/account/config';
import { ServiceLoader } from '../../../../serviceLoader';

jest.mock('../../../../../module/config');
jest.mock('../../../../../module/account/config/AccountUserConfig');

jest.mock('../PostActionController');
jest.mock('../../../../groupConfig');
jest.mock('../../../../../service/notificationCenter');
jest.mock('../../../../common/controller/impl/PreInsertController');
jest.mock('../../../../../dao');
jest.mock('../../../../groupConfig/dao');
jest.mock('../../../dao/PostDao');

class MockPreInsertController<T extends ExtendedBaseModel>
  implements IPreInsertController {
  async insert(entity: T): Promise<void> {
    return;
  }

  delete(entity: T): void {
    return;
  }

  async bulkDelete(entities: T[]): Promise<void> {
    return;
  }

  updateStatus(entity: T, status: PROGRESS_STATUS): void {
    return;
  }

  isInPreInsert(version: number): boolean {
    return false;
  }
}

describe('SendPostController', () => {
  let sendPostController: SendPostController;
  const groupConfigService: GroupConfigService = new GroupConfigService();
  const postDao = new PostDao(null);
  const accountDao = new AccountDao(null);
  beforeEach(() => {
    const actionController = new PostActionController(null, null);
    const preInsertController = new MockPreInsertController<Post>();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(groupConfigService);
    sendPostController = new SendPostController(
      actionController,
      preInsertController,
    );
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  describe('sendPost', () => {
    it('should add user id and company id into parameters', async () => {
      let correct = false;
      AccountUserConfig.prototype.getGlipUserId = jest
        .fn()
        .mockReturnValueOnce(4);
      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValueOnce(1);
      jest
        .spyOn(sendPostController, 'innerSendPost')
        .mockImplementationOnce((parameters: any, isRend: boolean) => {
          correct =
            parameters['creator_id'] === 4 &&
            parameters['company_id'] === 1 &&
            isRend === false;
        });
      await sendPostController.sendPost({ text: '', groupId: 4 });
      expect(correct).toBe(true);
    });
  });
  describe('reSendPost', () => {
    it('should call innerSendPost when local post exist', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({ id: -1 });
      jest
        .spyOn(sendPostController, 'innerSendPost')
        .mockResolvedValueOnce(null);
      await sendPostController.reSendPost(-1);
      expect(sendPostController.innerSendPost).toHaveBeenCalledTimes(1);
    });
    it('should return null when local post does not exist', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce(null);
      const result = await sendPostController.reSendPost(-1);
      expect(result).toEqual(null);
    });
    it('should return null id > 0', async () => {
      const result = await sendPostController.reSendPost(1);
      expect(result).toEqual(null);
    });
  });

  describe('innerSendPost', () => {
    it('should not call buildItemVersionMap when is resend or has not item_ids', async () => {
      jest
        .spyOn(sendPostController, '_cleanUploadingFiles')
        .mockReturnValue(null);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['item_ids'] = [];
      Object.assign(sendPostController, {
        _postItemController: { waiting4ItemsReady: () => {} },
      });
      await sendPostController.innerSendPost(data, false);
      expect(sendPostController._cleanUploadingFiles).toBeCalledTimes(0);

      data['item_ids'] = [];
      await sendPostController.innerSendPost(data, true);
      expect(sendPostController._cleanUploadingFiles).toBeCalledTimes(0);
    });
    it('should call buildItemVersionMap when it is not resend and has item_ids', async () => {
      jest
        .spyOn(sendPostController, '_cleanUploadingFiles')
        .mockReturnValue(null);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['item_ids'] = [1];
      Object.assign(sendPostController, {
        _postItemController: {
          waiting4ItemsReady: () => {},
          buildItemVersionMap: () => {},
        },
      });
      await sendPostController.innerSendPost(data, false);
      expect(sendPostController._cleanUploadingFiles).toBeCalledTimes(1);
    });
    it('should send post to sever when post is valid and call back success', async () => {
      Object.assign(sendPostController, {
        _postItemController: {
          waiting4ItemsReady: (a: any, b: any, callback: any) => {
            callback({ success: true, obj: { item_ids: [1] } });
          },
        },
      });

      jest
        .spyOn(sendPostController, 'sendPostToServer')
        .mockReturnValueOnce(null);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['text'] = '2323';
      data['item_ids'] = [];
      await sendPostController.innerSendPost(data, false);
      expect(sendPostController.sendPostToServer).toBeCalledTimes(1);
    });
    it('should delete post when post is invalid', async () => {
      let shouldBeCalled = false;
      Object.assign(sendPostController, {
        _postItemController: {
          waiting4ItemsReady: (a: any, b: any, callback: any) => {
            callback({ success: true, obj: { item_ids: [] } });
          },
        },
        postActionController: {
          deletePost: () => {
            shouldBeCalled = true;
          },
        },
      });
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['text'] = '';
      data['item_ids'] = [];
      await sendPostController.innerSendPost(data, false);
      expect(shouldBeCalled).toEqual(true);
    });
    it('should call send post fail when post is valid but call back fail', async () => {
      Object.assign(sendPostController, {
        _postItemController: {
          waiting4ItemsReady: (a: any, b: any, callback: any) => {
            callback({ success: false, obj: { item_ids: [] } });
          },
        },
      });
      jest
        .spyOn(sendPostController, 'handleSendPostFail')
        .mockReturnValueOnce(null);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['text'] = '2323';
      data['item_ids'] = [];
      await sendPostController.innerSendPost(data, false);
      expect(sendPostController.handleSendPostFail).toBeCalledTimes(1);
    });
  });

  describe('sendPostToServer', () => {
    it('should call return PostData when send post success', async () => {
      Object.assign(sendPostController, {
        postActionController: {
          requestController: {
            post: () => {
              return serverPostJson4UnitTest;
            },
          },
        },
      });
      postDao.put.mockResolvedValueOnce(null);
      daoManager.getDao.mockReturnValueOnce(postDao);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['id'] = -999;
      const result = await sendPostController.sendPostToServer(data);
      expect(result[0].data).toEqual(serverPostJson4UnitTest);
    });
    it('should call with retryCount', async () => {
      let retryCount;
      Object.assign(sendPostController, {
        postActionController: {
          requestController: {
            post: (data: any, option: any) => {
              retryCount = option && option.retryCount;
              return serverPostJson4UnitTest;
            },
          },
        },
      });
      postDao.put.mockResolvedValueOnce(null);
      daoManager.getDao.mockReturnValueOnce(postDao);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['id'] = -999;
      const result = await sendPostController.sendPostToServer(data);
      expect(result[0].data).toEqual(serverPostJson4UnitTest);
      expect(retryCount).toEqual(3);
    });
    it('should throw error when send post failed', async () => {
      Object.assign(sendPostController, {
        postActionController: {
          requestController: {
            post: () => {
              throw new Error();
            },
          },
        },
      });
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['id'] = -999;
      try {
        await sendPostController.sendPostToServer(data);
        expect(true).toBeFalsy();
      } catch (e) {
        expect(true).toBeTruthy();
      }
    });
  });
  describe('handleSendPostSuccess', () => {
    it('should call the process of handle post', async () => {
      const data = _.cloneDeep(serverPostJson4UnitTest);
      postDao.put.mockResolvedValueOnce(null);
      daoManager.getDao.mockReturnValueOnce(postDao);
      await sendPostController.handleSendPostSuccess(data, { id: -999 });
      expect(notificationCenter.emitEntityReplace).toHaveBeenCalledTimes(1);
      expect(groupConfigService.deletePostId).toBeCalledWith(7848853506, -999);
      expect(postDao.put).toHaveBeenCalledTimes(1);
    });
  });
  describe('handleSendPostFail', () => {
    it('should call incomesStatusChange and addPostId when send post failed', async () => {
      groupConfigService.addPostId.mockResolvedValueOnce(null);
      const result = await sendPostController.handleSendPostFail(-1, 2);
      expect(result.length).toBe(0);
      expect(groupConfigService.addPostId).toBeCalledTimes(1);
    });
  });
});
