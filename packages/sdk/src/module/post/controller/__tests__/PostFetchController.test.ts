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
import { EntitySourceController } from '../../../../framework/controller/impl/EntitySourceController';
import { PostFetchController } from '../PostFetchController';
import PostAPI from '../../../../api/glip/post';
import { JNetworkError, ERROR_CODES_NETWORK } from 'foundation';
import { Post } from '../../entity/Post';
import { PostDataController } from '../PostDataController';
import { ServiceLoader } from '../../../serviceLoader';

jest.mock('../../../../dao');
jest.mock('../../dao');
jest.mock('../../../../framework/controller');
jest.mock('../../../item');
jest.mock('../../../../api/glip/post');
jest.mock('../../../../framework/controller/impl/EntitySourceController');
jest.mock('../PostDataController');

const postDao = new PostDao(null as any);
const itemDao = new ItemDao(null as any);

const entitySourceController = new EntitySourceController<Post>(null, null);
const itemService = new ItemService();
const groupService = {
  hasMorePostInRemote: jest.fn(),
  updateHasMore: jest.fn(),
};

function setup() {
  ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
  itemService.handleIncomingData = jest.fn();
  daoManager.getDao.mockImplementation(arg => {
    if (arg === PostDao) {
      return postDao;
    }
    if (arg === ItemDao) {
      return itemDao;
    }
  });
}

describe('PostFetchController()', () => {
  const postDataController = new PostDataController(
    groupService,
    null,
    entitySourceController,
  );
  // const groupService = new GroupService();
  const postFetchController = new PostFetchController(
    groupService,
    postDataController,
    entitySourceController,
  );

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
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
      const mockPosts = [
        { id: 1, version: 1, unique_id: '1' },
        { id: 2, version: 2, unique_id: '2' },
      ];
      const mockItems = [{ id: 11 }, { id: 22 }];
      const data = {
        posts: [
          { id: 3, version: 3, unique_id: '3' },
          { id: 4, version: 4, unique_id: '4' },
        ],
        items: [{ id: 12 }, { id: 23 }],
      };
      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupId')
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
        posts: [
          { id: 1, version: 1, unique_id: '1' },
          { id: 2, version: 2, unique_id: '2' },
          { id: 3, version: 3, unique_id: '3' },
          { id: 4, version: 4, unique_id: '4' },
        ],
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
        .spyOn(postFetchController, 'getRemotePostsByGroupId')
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
      const mockPosts = [{ id: 1, version: 1 }, { id: 2, version: 2 }];
      const mockItems = [{ id: 11 }, { id: 22 }];
      const data = {
        posts: [],
        items: [],
      };
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupId')
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
        posts: [{ id: 3, version: 3 }, { id: 4, version: 4 }],
        items: [{ id: 12 }, { id: 23 }],
      };
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupId')
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

    it('should return server results when shouldSaveToDb===false & api request is success', async () => {
      const data = {
        posts: [{ id: 1, version: 1 }, { id: 2, version: 2 }],
        items: [{ id: 11 }, { id: 22 }],
      };
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupId')
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

    it('should return empty when shouldSaveToDb===false & local is empty & remote is empty', async () => {
      const mockPosts = [];
      const mockItems = [];
      const data = {
        posts: [],
        items: [],
      };
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(false);
      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);

      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupId')
        .mockResolvedValueOnce({
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

    it('should remove pre-insert post when shouldSaveToDb===true & local count < limit', async () => {
      const mockPosts = [
        { id: -1, version: 100, unique_id: '100' },
        { id: 2, version: 101, unique_id: '101' },
      ];
      const mockItems = [{ id: 11 }, { id: 22 }];
      const data = {
        posts: [
          { id: 3, version: 100, unique_id: '100' },
          { id: 4, version: 102, unique_id: '102' },
        ],
        items: [{ id: 12 }, { id: 23 }],
      };
      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupId')
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
        posts: [
          { id: 2, version: 101, unique_id: '101' },
          { id: 3, version: 100, unique_id: '100' },
          { id: 4, version: 102, unique_id: '102' },
        ],
        limit: 20,
      });
    });

    it('should getRemotePostsByGroupId with both direction if should not save to db', async () => {
      const mockPosts = [];
      const mockItems = [];
      const data = {
        posts: [],
        items: [],
      };
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(false);
      groupService.hasMorePostInRemote.mockResolvedValueOnce(true);
      itemService.getByPosts.mockResolvedValue(mockItems);

      jest
        .spyOn(postFetchController, 'getRemotePostsByGroupId')
        .mockResolvedValueOnce({
          hasMore: false,
          ...data,
        });

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        postId: 1,
        limit: 20,
        direction: QUERY_DIRECTION.BOTH,
      });

      expect(postFetchController.getRemotePostsByGroupId).toBeCalledWith({
        groupId: 1,
        postId: 1,
        limit: 20,
        direction: QUERY_DIRECTION.BOTH,
        shouldSaveToDb: false,
      });

      expect(result).toEqual({
        hasMore: false,
        items: [],
        posts: [],
        limit: 20,
      });
    });

    it('should getRemotePostsByGroupId with old direction if should save to db', async () => {
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
        .spyOn(postFetchController, 'getRemotePostsByGroupId')
        .mockResolvedValueOnce({
          hasMore: false,
          ...data,
        });

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 20,
        direction: QUERY_DIRECTION.BOTH,
      });

      expect(postFetchController.getRemotePostsByGroupId).toBeCalledWith({
        groupId: 1,
        postId: 0,
        limit: 20,
        direction: QUERY_DIRECTION.OLDER,
        shouldSaveToDb: true,
      });

      expect(result).toEqual({
        hasMore: false,
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
      const mockNormal = data;
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
      const mockNotPostId = data;
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
      const mockNoMatch = { posts: [], items: [] };
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
      PostAPI.requestPosts.mockRejectedValueOnce(
        new JNetworkError(ERROR_CODES_NETWORK.GENERAL, 'error'),
      );
      expect.assertions(1);
      await expect(
        postFetchController.fetchPaginationPosts({
          groupId: 1,
          postId: 1,
          limit: 1,
        }),
      ).rejects.toBeInstanceOf(JNetworkError);
    });
  });

  describe('getRemotePostsByGroupId()', () => {
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

    it('should throw exception when request server error', async () => {
      PostAPI.requestPosts.mockRejectedValueOnce(
        new JNetworkError(ERROR_CODES_NETWORK.GENERAL, 'error'),
      );
      await expect(
        postFetchController.getRemotePostsByGroupId(getParaMeters(true)),
      ).rejects.toBeInstanceOf(JNetworkError);
    });

    it('should not call updateHasMore when should not save', async () => {
      const data = {
        posts: [{ id: 3 }, { id: 4 }],
        items: [{ id: 12 }, { id: 23 }],
      };
      const mockNormal = data;
      PostAPI.requestPosts.mockResolvedValue(mockNormal);
      itemService.handleIncomingData = jest
        .fn()
        .mockResolvedValueOnce(data.items);
      groupService.updateHasMore.mockImplementationOnce(() => {});

      const result = await postFetchController.getRemotePostsByGroupId(
        getParaMeters(false),
      );

      expect(groupService.updateHasMore).toHaveBeenCalledTimes(0);
      expect(postDataController.handleFetchedPosts).toBeCalledWith(
        { hasMore: false, posts: data.posts, items: data.items },
        false,
      );
    });

    it('should call updateHasMore when should save', async () => {
      const data = {
        posts: [{ id: 3 }, { id: 4 }],
        items: [{ id: 12 }, { id: 23 }],
      };
      const mockNormal = data;
      PostAPI.requestPosts.mockResolvedValue(mockNormal);
      jest
        .spyOn(postDataController, 'handleFetchedPosts')
        .mockResolvedValueOnce({
          posts: data.posts,
          items: data.items,
          hasMore: false,
        });
      const result = await postFetchController.getRemotePostsByGroupId(
        getParaMeters(true),
      );
      groupService.updateHasMore.mockImplementationOnce(() => {});
      expect(groupService.updateHasMore).toHaveBeenCalledTimes(1);
      expect(result.hasMore).toBeFalsy();
    });
  });
});
