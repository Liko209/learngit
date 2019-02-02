/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-23 09:04:37
 * Copyright © RingCentral. All rights reserved.
 */

import { postFactory, itemFactory } from '../../../../__tests__/factories';
import { ItemService } from '../../../item';
import { ItemDao } from '../../../item/dao';
import { daoManager, QUERY_DIRECTION } from '../../../../dao';
import { PostDao } from '../../dao';
import { ExtendedBaseModel } from '../../../models';
import { IPreInsertController } from '../../../common/controller/interface/IPreInsertController';
import { PostFetchController } from '../PostFetchController';
import { PROGRESS_STATUS } from '../../../progress';
import PostAPI from '../../../../api/glip/post';
import { ApiResultOk, ApiResultErr } from '../../../../api/ApiResult';
import { BaseResponse, JNetworkError, ERROR_CODES_NETWORK } from 'foundation';
import { NewGroupService } from '../../../../module/group/service';
import { GROUP_QUERY_TYPE } from '../../../../service';

jest.mock('../../../../dao');
jest.mock('../../dao');
jest.mock('../../../../framework/controller');
jest.mock('../../../item');
jest.mock('../../../../api/glip/post');

class MockPreInsertController<T extends ExtendedBaseModel>
  implements IPreInsertController {
  insert(entity: T): Promise<void> {
    return;
  }
  delete(entity: T): void {
    return;
  }
  bulkDelete(entities: T[]): Promise<void> {
    return;
  }
  updateStatus(entity: T, status: PROGRESS_STATUS): void {
    return;
  }
  isInPreInsert(version: number): boolean {
    return;
  }
}

describe('PostFetchController()', () => {
  const itemService = new ItemService();
  const postDao = new PostDao(null);
  const itemDao = new ItemDao(null);
  // const groupService = new NewGroupService();
  const preInsertController = new MockPreInsertController();
  const postFetchController = new PostFetchController(
    preInsertController,
    null,
  );
  const groupService = {
    hasMorePostInRemote: jest.fn(),
    updateHasMore: jest.fn(),
  };

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  function setup() {
    ItemService.getInstance = jest.fn().mockReturnValue(itemService);
    itemService.handleIncomingData = jest.fn();
    NewGroupService.getInstance = jest.fn().mockReturnValue(groupService);
    daoManager.getDao.mockImplementation(arg => {
      if (arg === PostDao) {
        return postDao;
      }
      if (arg === ItemDao) {
        return itemDao;
      }
    });
  }

  afterAll(() => {
    clearMocks();
  });

  describe('getPostsByGroupId()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should just return local post when shouldSaveToDb===true & local count >= limit', async () => {
      const mockPosts = postFactory.buildList(2);
      const mockItems = itemFactory.buildList(3);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 2,
      });

      expect(result).toEqual({
        hasMore: true,
        items: mockItems,
        posts: mockPosts,
        limit: 2,
      });
    });

    it('should return local + server result when shouldSaveToDb===true & local count < limit', async () => {
      const mockPosts = [{ id: 1 }, { id: 2 }];
      const mockItems = [{ id: 11 }, { id: 22 }];
      const data = {
        posts: [{ id: 3 }, { id: 4 }],
        items: [{ id: 12 }, { id: 23 }],
      };
      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupIdAndSave')
        .mockResolvedValueOnce({
          success: true,
          hasMore: false,
          ...data,
        });
      itemService.handleIncomingData = jest
        .fn()
        .mockResolvedValueOnce(data.items);

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });

      expect(result).toEqual({
        hasMore: false,
        items: [{ id: 11 }, { id: 22 }, { id: 12 }, { id: 23 }],
        posts: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        limit: 20,
      });
    });

    it('should return empty result when shouldSaveToDb===true & local remote is empty', async () => {
      const mockPosts = [];
      const mockItems = [];
      const data = {
        posts: [],
        items: [],
      };
      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupIdAndSave')
        .mockResolvedValueOnce({
          success: true,
          hasMore: false,
          ...data,
        });

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });

      expect(result).toEqual({
        hasMore: false,
        items: [],
        posts: [],
        limit: 20,
      });
    });

    it('should return local result when shouldSaveToDb===true & local is not empty & remote is empty', async () => {
      const mockPosts = [{ id: 1 }, { id: 2 }];
      const mockItems = [{ id: 11 }, { id: 22 }];
      const data = {
        posts: [],
        items: [],
      };
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupIdAndSave')
        .mockResolvedValueOnce({
          success: true,
          hasMore: false,
          ...data,
        });

      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });

      expect(result).toEqual({
        hasMore: false,
        items: mockItems,
        posts: mockPosts,
        limit: 20,
      });
    });

    it('should return local result when shouldSaveToDb===true & local is empty & remote is not empty', async () => {
      const mockPosts = [];
      const mockItems = [];
      const data = {
        posts: [{ id: 3 }, { id: 4 }],
        items: [{ id: 12 }, { id: 23 }],
      };
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupIdAndSave')
        .mockResolvedValueOnce({
          success: true,
          hasMore: false,
          ...data,
        });

      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });

      expect(result).toEqual({
        hasMore: false,
        items: data.items,
        posts: data.posts,
        limit: 20,
      });
    });

    it('should return empty result when shouldSaveToDb===true & local is empty & api request is failed', async () => {
      const mockPosts = [{ id: 1 }, { id: 2 }];
      const mockItems = [{ id: 11 }, { id: 22 }];
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(true);
      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupIdAndSave')
        .mockResolvedValueOnce({
          success: false,
        });

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });

      expect(result).toEqual({
        hasMore: true,
        items: mockItems,
        posts: mockPosts,
        limit: 20,
      });
    });

    it('should return local results when shouldSaveToDb===true & local is not empty & api request is failed', async () => {
      const mockPosts = [];
      const mockItems = [];
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(true);
      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupIdAndSave')
        .mockResolvedValueOnce({
          success: false,
        });

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });

      expect(result).toEqual({
        hasMore: true,
        items: [],
        posts: [],
        limit: 20,
      });
    });

    it('should return server results when shouldSaveToDb===false & api request is success', async () => {
      const data = {
        posts: [{ id: 1 }, { id: 2 }],
        items: [{ id: 11 }, { id: 22 }],
      };
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupIdAndSave')
        .mockResolvedValueOnce({
          success: true,
          hasMore: false,
          ...data,
        });

      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(false);
      itemService.handleIncomingData = jest
        .fn()
        .mockResolvedValueOnce(data.items);

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        postId: 11,
        limit: 20,
      });
      expect(result).toEqual({
        posts: data.posts,
        items: data.items,
        hasMore: false,
        limit: 20,
      });
    });

    it('should return empty when shouldSaveToDb===false & local is empty & api request is failed', async () => {
      const mockPosts = [];
      const mockItems = [];
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(false);
      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);

      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupIdAndSave')
        .mockResolvedValueOnce({
          success: false,
        });

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });

      expect(result).toEqual({
        hasMore: true,
        items: [],
        posts: [],
        limit: 20,
      });
    });
  });

  describe('fetchPaginationPosts()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    const data = {
      posts: [{ _id: 1 }, { _id: 2 }],
      items: [{ _id: 22 }, { _id: 22 }],
    };

    it('should return posts when postid is available', async () => {
      const mockNormal = new ApiResultOk(data, {
        status: 200,
        headers: {},
      } as BaseResponse);
      PostAPI.requestPosts.mockResolvedValue(mockNormal);
      const result = await postFetchController.fetchPaginationPosts({
        groupId: 1,
        postId: 11,
        limit: 20,
      });
      expect(result).toEqual({
        posts: data.posts,
        items: data.items,
        hasMore: false,
      });
    });

    it('should return post when no postid is specific', async () => {
      const mockNotPostId = new ApiResultOk(data, {
        status: 200,
        headers: {},
      } as BaseResponse);
      PostAPI.requestPosts.mockResolvedValue(mockNotPostId);
      const result = await postFetchController.fetchPaginationPosts({
        groupId: 1,
        limit: 2,
      });
      expect(result).toEqual({
        posts: data.posts,
        items: data.items,
        hasMore: true,
      });
    });

    it('should return [] when no matched', async () => {
      const mockNoMatch = new ApiResultOk({ posts: [], items: [] }, {
        status: 200,
        headers: {},
      } as BaseResponse);
      PostAPI.requestPosts.mockResolvedValue(mockNoMatch);
      const result = await postFetchController.fetchPaginationPosts({
        groupId: 1,
        limit: 2,
      });
      expect(result).toEqual({
        posts: [],
        items: [],
        hasMore: false,
      });
    });

    it('should throw exception if failed to request', async () => {
      PostAPI.requestPosts.mockRejectedValueOnce({});
      await expect(
        postFetchController.fetchPaginationPosts({
          groupId: 1,
          postId: 1,
          limit: 1,
        }),
      ).rejects.toBeDefined();
    });
  });

  describe('getRemotePostsByGroupIdAndSave', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });
    function getParaMeters(shouldSaveToDb: boolean) {
      return {
        shouldSaveToDb,
        direction: QUERY_DIRECTION.OLDER,
        groupId: 10,
        limit: 20,
        postId: 0,
      };
    }
    it('should be true when request server error', async () => {
      PostAPI.requestPosts.mockResolvedValueOnce(
        new ApiResultErr(
          new JNetworkError(ERROR_CODES_NETWORK.GENERAL, 'error'),
            {
              status: 403,
              headers: {},
            } as BaseResponse,
        ),
      );
      const result = await postFetchController.getRemotePostsByGroupIdAndSave(
        getParaMeters(true),
      );
      expect(result.success).toBeFalsy();
      expect(result.hasMore).toBeTruthy();
    });
    it('should not call updateHasMore when should not save', async () => {
      const data = {
        posts: [{ id: 3 }, { id: 4 }],
        items: [{ id: 12 }, { id: 23 }],
      };
      const mockNormal = new ApiResultOk(data, {
        status: 200,
        headers: {},
      } as BaseResponse);
      PostAPI.requestPosts.mockResolvedValue(mockNormal);
      itemService.handleIncomingData = jest
        .fn()
        .mockResolvedValueOnce(data.items);
      groupService.updateHasMore.mockImplementationOnce(() => {});

      const result = await postFetchController.getRemotePostsByGroupIdAndSave(
        getParaMeters(false),
      );

      expect(groupService.updateHasMore).toHaveBeenCalledTimes(0);
      expect(result.items).toEqual(data.items);
      expect(result.posts).toEqual(data.posts);
    });
    it('should not call updateHasMore when should save', async () => {
      const data = {
        posts: [{ id: 3 }, { id: 4 }],
        items: [{ id: 12 }, { id: 23 }],
      };
      const mockNormal = new ApiResultOk(data, {
        status: 200,
        headers: {},
      } as BaseResponse);
      PostAPI.requestPosts.mockResolvedValue(mockNormal);

      const result = await postFetchController.getRemotePostsByGroupIdAndSave(
        getParaMeters(true),
      );
      groupService.updateHasMore.mockImplementationOnce(() => {});
      expect(groupService.updateHasMore).toHaveBeenCalledTimes(1);
      expect(result.success).toBeTruthy();
      expect(result.hasMore).toBeFalsy();
    });
  });
});
