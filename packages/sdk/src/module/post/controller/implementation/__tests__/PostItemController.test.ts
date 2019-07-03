/// <reference path="../../../../../__tests__/types.d.ts" />
/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-15 11:17:30
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { ItemService } from '../../../../../module/item';

import { PROGRESS_STATUS } from '../../../../progress';
import { Post } from '../../../entity';
import { EditPostType } from '../../../types';
import { IPostActionController } from '../../interface/IPostActionController';
import { PostItemController } from '../PostItemController';
import { localPostJson4UnitTest } from './PostData';
import { ServiceLoader } from '../../../../serviceLoader';
import { daoManager } from 'sdk/dao';
import { PostDao } from 'sdk/module/post/dao';
import PostAPI from 'sdk/api/glip/post';
import { IProcessor } from 'sdk/framework/processor';

jest.mock('sdk/dao');
jest.mock('sdk/module/post/dao');
jest.mock('sdk/api/glip/post');
jest.mock('sdk/module/item');
jest.mock('sdk/framework/processor');
class FakeActionController implements IPostActionController {
  likePost(
    postId: number,
    personId: number,
    toLike: boolean,
  ): Promise<Post | null> {
    return null;
  }
  editPost(params: EditPostType): Promise<Post> {
    return null;
  }

  deletePost(id: number): Promise<boolean> {
    return Promise.resolve(true);
  }

  updateLocalPost(post: Partial<Post>): Promise<Post> {
    return null;
  }
}

let postItemController: PostItemControllers;

describe('PostItemController', () => {
  const itemService = new ItemService();
  let postDao: PostDao;
  beforeEach(() => {
    postDao = new PostDao(null);
    daoManager.getDao.mockImplementation(arg => {
      if (arg === PostDao) {
        return postDao;
      }
    });
    ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
    const fakeActionController = new FakeActionController();
    postItemController = new PostItemController(fakeActionController);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('waiting4ItemsReady', () => {
    it('should callback with true when not pseudo items', async () => {
      let result;
      await postItemController.waiting4ItemsReady(
        localPostJson4UnitTest,
        false,
        (data: { success: boolean; obj: Partial<Post> }) => {
          result = data;
        },
      );
      expect(result.success).toBe(true);
    });

    it('should callback with false when pseudo items does not in Progress status', async () => {
      let result;
      jest
        .spyOn(postItemController, 'hasItemInTargetStatus')
        .mockReturnValueOnce(false);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['item_ids'] = [-1];
      await postItemController.waiting4ItemsReady(
        data,
        false,
        (data: { success: boolean; obj: Partial<Post> }) => {
          result = data;
        },
      );
      expect(result.success).toBe(false);
    });

    it('should resendFailedItems when is resend', async () => {
      let result;
      jest
        .spyOn(postItemController, 'resendFailedItems')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(postItemController, 'waiting4Items')
        .mockResolvedValueOnce(null);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['item_ids'] = [-1];
      await postItemController.waiting4ItemsReady(
        data,
        true,
        (data: { success: boolean; obj: Partial<Post> }) => {
          result = data;
        },
      );
      expect(postItemController.resendFailedItems).toHaveBeenCalledTimes(1);
      expect(postItemController.waiting4Items).toHaveBeenCalledTimes(1);
    });
  });

  describe('buildItemVersionMap', () => {
    it('should return undefined when it is not itemIds', async () => {
      const result = await postItemController.buildItemVersionMap(1, []);
      expect(result).toEqual(undefined);
    });
    it('should return undefined when does not need to check items', async () => {
      itemService.getUploadItems.mockReturnValueOnce([
        { id: 10, is_new: false },
      ]);
      const result = await postItemController.buildItemVersionMap(1, [3]);
      expect(result).toEqual(undefined);
    });

    it('should return item data when should update item version', async () => {
      itemService.getUploadItems.mockReturnValueOnce([
        { id: 10, is_new: false },
      ]);
      itemService.getItemVersion.mockResolvedValueOnce(3);
      const result = await postItemController.buildItemVersionMap(1, [10]);
      expect(result).toEqual({
        version_map: { 10: 3 },
      });
    });
  });
  describe('waiting4Items', () => {});
  describe('updatePreInsertItemVersion', () => {
    it('update item should be set to the end of array', () => {
      const post = _.cloneDeep(localPostJson4UnitTest);
      post.item_ids = [-1, -2, -3];
      const result = postItemController.updatePreInsertItemVersion(post, {
        status: PROGRESS_STATUS.SUCCESS,
        preInsertId: -1,
        updatedId: 1,
      });
      expect(result.post.item_ids).toEqual([-2, -3, 1]);
    });

    it('should return shouldUpdatePost = false when PROGRESS_STATUS = FAIL', () => {
      const post = _.cloneDeep(localPostJson4UnitTest);
      const result = postItemController.updatePreInsertItemVersion(post, {
        status: PROGRESS_STATUS.FAIL,
        personId: -1,
        updatedId: 2,
      });
      expect(result.shouldUpdatePost).toBe(false);
    });
    it('should return shouldUpdatePost = true and remove preInsertId from item_ids when PROGRESS_STATUS = CANCEL', () => {
      const post = _.cloneDeep(localPostJson4UnitTest);
      post['item_ids'] = [-1];
      expect(post['item_ids']).toEqual([-1]);
      const result = postItemController.updatePreInsertItemVersion(post, {
        status: PROGRESS_STATUS.CANCELED,
        preInsertId: -1,
        updatedId: 2,
      });
      expect(result.shouldUpdatePost).toBe(true);
      expect(result.post['item_ids']).toEqual([]);
    });
    it('should update item_ids when preInsertId in item_ids and PROGRESS_STATUS=SUCCESS', () => {
      const post = _.cloneDeep(localPostJson4UnitTest);
      post['item_ids'] = [-1];
      expect(post['item_ids']).toEqual([-1]);
      const result = postItemController.updatePreInsertItemVersion(post, {
        status: PROGRESS_STATUS.SUCCESS,
        preInsertId: -1,
        updatedId: 2,
      });
      expect(result.shouldUpdatePost).toBe(true);
      expect(result.post['item_ids']).toEqual([2]);
    });

    it('should update item_data when preInsertId in item_ids and PROGRESS_STATUS=SUCCESS', () => {
      const post = _.cloneDeep(localPostJson4UnitTest);
      post['item_ids'] = [-10086];
      const versionMap = {};
      versionMap['-10086'] = 'version -10086';
      post['item_data'] = {
        version_map: versionMap,
      };
      const result = postItemController.updatePreInsertItemVersion(post, {
        status: PROGRESS_STATUS.SUCCESS,
        preInsertId: -10086,
        updatedId: 2,
      });
      expect(result.shouldUpdatePost).toBe(true);
      expect(result.post['item_ids']).toEqual([2]);
      expect(result.post['item_data']['version_map']).toEqual({
        2: 'version -10086',
      });
    });
  });
  describe('resendFailedItems', () => {
    it('should call itemService.resendFailedItems', async () => {
      itemService.resendFailedItems.mockResolvedValueOnce(null);
      await postItemController.resendFailedItems([]);
      expect(itemService.resendFailedItems).toBeCalledTimes(1);
    });
  });
  describe('getPseudoItemIds', () => {
    it('should return all minus ids', () => {
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['item_ids'] = [1, -2, -3];
      expect(postItemController.getPseudoItemIds(data)).toEqual([-2, -3]);
    });

    it('should return empty when there are not minus ids', () => {
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['item_ids'] = [1, 2];
      expect(postItemController.getPseudoItemIds(data)).toEqual([]);
    });
  });
  describe('getPseudoItemStatusInPost', () => {
    it('should return unique array', () => {
      itemService.getItemsSendingStatus.mockReturnValueOnce([
        PROGRESS_STATUS.CANCELED,
        PROGRESS_STATUS.FAIL,
        PROGRESS_STATUS.CANCELED,
      ]);
      const result = postItemController.getPseudoItemStatusInPost(
        localPostJson4UnitTest,
      );
      expect(result).toEqual([PROGRESS_STATUS.CANCELED, PROGRESS_STATUS.FAIL]);
    });
  });
  describe('hasItemInTargetStatus', () => {
    it('should return true when still has items in progress', () => {
      itemService.getItemsSendingStatus.mockReturnValueOnce([
        PROGRESS_STATUS.INPROGRESS,
      ]);
      const result = postItemController.hasItemInTargetStatus(
        localPostJson4UnitTest,
        PROGRESS_STATUS.INPROGRESS,
      );
      expect(result).toBe(true);
    });
    it('should return false when all items have uploaded successfully but pass PROGRESS_STATUS.INPROGRESS', () => {
      itemService.getItemsSendingStatus.mockReturnValueOnce([
        PROGRESS_STATUS.SUCCESS,
      ]);
      const result = postItemController.hasItemInTargetStatus(
        localPostJson4UnitTest,
        PROGRESS_STATUS.INPROGRESS,
      );
      expect(result).toBe(false);
    });
  });

  describe('getLatestPostIdByItem', () => {
    it('should call addProcessor', (done: jest.DoneCallback) => {
      postItemController['_sequenceProcessor'].addProcessor = jest.fn();
      postItemController.getLatestPostIdByItem(1, 1);
      setTimeout(() => {
        expect(
          postItemController['_sequenceProcessor'].addProcessor,
        ).toBeCalled();
        done();
      },         0);
    });
  });

  describe('_addProcessorStrategy()', () => {
    const removedProcessor: IProcessor = {
      process: jest.fn(),
      name: jest.fn(),
      cancel: jest.fn(),
    };
    const newProcessor: IProcessor = {
      process: jest.fn(),
      name: jest.fn(),
      cancel: jest.fn(),
    };
    it('should change old to new when have two processor', async () => {
      const result = await postItemController['_addProcessorStrategy'](
        [removedProcessor],
        newProcessor,
        true,
      );
      expect(result).toEqual([newProcessor]);
      expect(removedProcessor.cancel).toBeCalled();
    });

    it('should add a new when have one processor', async () => {
      const totalProcessors: IProcessor[] = [];
      totalProcessors.forEach = jest.fn();
      const result = await postItemController['_addProcessorStrategy'](
        totalProcessors,
        newProcessor,
        true,
      );
      expect(result).toEqual([newProcessor]);
      expect(totalProcessors.forEach).not.toBeCalled();
    });
  });

  describe('_getLatestPostIdByItem()', () => {
    beforeEach(() => {
      const localPosts = [
        {
          id: 5,
          group_id: 1,
          created_at: 5,
        },
        {
          id: 6,
          group_id: 1,
          created_at: 6,
        },
        {
          id: 7,
          group_id: 1,
          created_at: 7,
        },
      ];
      const remoteData = {
        posts: [
          {
            id: 3,
            group_id: 1,
            created_at: 3,
          },
          {
            id: 4,
            group_id: 1,
            created_at: 4,
          },
          {
            id: 1,
            group_id: 5,
            created_at: 1,
          },
          {
            id: 2,
            group_id: 1,
            created_at: 2,
            deactivated: true,
          },
        ],
      };
      itemService.getById = jest
        .fn()
        .mockResolvedValue({ post_ids: [4, 5, 6, 7] });
      postDao.batchGet = jest.fn().mockResolvedValue(localPosts);
      PostAPI.requestByIds = jest.fn().mockResolvedValue(remoteData);
    });
    it('should return latest post id is 7 when get post in local', async () => {
      const result = await postItemController['_getLatestPostIdByItem']({
        groupId: 1,
        itemId: 1,
      });
      expect(PostAPI.requestByIds).not.toBeCalled();
      expect(result.id).toBe(7);
    });
    it('should return latest post id is 5 when can not get post in local', async () => {
      postDao.batchGet = jest.fn().mockResolvedValue([
        {
          id: 7,
          group_id: 2,
          created_at: 7,
        },
      ]);
      const result = await postItemController['_getLatestPostIdByItem']({
        groupId: 1,
        itemId: 1,
      });
      expect(PostAPI.requestByIds).toBeCalled();
      expect(result.id).toBe(4);
    });
    it('should return null when post_ids is not in local and remote', async () => {
      postDao.batchGet = jest.fn().mockResolvedValue([]);
      PostAPI.requestByIds = jest.fn().mockResolvedValue({ posts: [] });
      const result = await postItemController['_getLatestPostIdByItem']({
        groupId: 1,
        itemId: 1,
      });
      expect(result).toBeNull();
    });
    it('should return null when item is null', async () => {
      itemService.getById = jest.fn().mockResolvedValue(null);
      const result = await postItemController['_getLatestPostIdByItem']({
        groupId: 1,
        itemId: 1,
      });
      expect(result).toBeNull();
    });
  });
});
