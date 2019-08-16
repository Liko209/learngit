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
import { JNetworkError, ERROR_CODES_NETWORK } from 'foundation/error';
import { Post } from '../../entity/Post';
import { PostDataController } from '../PostDataController';
import { ServiceLoader } from '../../../serviceLoader';
import _ from 'lodash';
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
  handleGroupFetchedPosts: jest.fn(),
};

describe('PostFetchController()', () => {
  const postDataController = new PostDataController(
    groupService,
    null,
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

    postDataController.handleFetchedPosts = jest.fn().mockResolvedValue({
      posts: [],
      items: [],
      hasMore: true,
    });
  }

  function getMockHasMore({
    older = true,
    newer = true,
    both = true,
  }: {
    older?: boolean;
    newer?: boolean;
    both?: boolean;
  }) {
    return _.cloneDeep({ older, newer, both });
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
        hasMore: getMockHasMore({}),
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
      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
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
        hasMore: getMockHasMore({ older: false }),
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

    it('should not remove posts if unique id in posts is undefined', async () => {
      const mockPosts = [{ id: 1, version: 1 }, { id: 2, version: 2 }];
      const mockItems = [{ id: 11 }, { id: 22 }];
      const data = {
        posts: [{ id: 3, version: 3 }, { id: 4, version: 4 }],
        items: [{ id: 12 }, { id: 23 }],
      };
      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
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
        hasMore: getMockHasMore({ older: false }),
        items: [{ id: 11 }, { id: 22 }, { id: 12 }, { id: 23 }],
        posts: [
          { id: 1, version: 1 },
          { id: 2, version: 2 },
          { id: 3, version: 3 },
          { id: 4, version: 4 },
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
      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
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
        hasMore: getMockHasMore({ older: false }),
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

      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });

      expect(result).toEqual({
        hasMore: getMockHasMore({ older: false }),
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

      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);

      const result = await postFetchController.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });

      expect(result).toEqual({
        hasMore: getMockHasMore({ older: false }),
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
      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
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
        hasMore: getMockHasMore({ older: false }),
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
      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
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
        hasMore: getMockHasMore({ older: false }),
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
      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
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
        hasMore: getMockHasMore({ older: false }),
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
      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
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
        hasMore: getMockHasMore({ both: false, newer: false }),
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
      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
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
        hasMore: getMockHasMore({ older: false }),
        items: [],
        posts: [],
        limit: 20,
      });
    });

    it('should not change the default HAS_MORE value', async ()=>{
      const mockData = {
        limit: 20,
        posts:[],
        items:[],
        hasMore: getMockHasMore({})
      };
        jest.spyOn(postFetchController, '_getPostsFromDb').mockResolvedValueOnce(_.cloneDeep(mockData));
        groupService.hasMorePostInRemote.mockResolvedValueOnce(getMockHasMore({older: false}));
        let result = await postFetchController.getPostsByGroupId({
          groupId: 1,
        });
        expect(result.hasMore).toEqual(getMockHasMore({older: false}));

        jest.spyOn(postFetchController, '_getPostsFromDb').mockResolvedValueOnce(_.cloneDeep(mockData));
        groupService.hasMorePostInRemote.mockResolvedValueOnce(getMockHasMore({newer: false}));
        result = await postFetchController.getPostsByGroupId({
          groupId: 1,
          direction: QUERY_DIRECTION.NEWER
        });
        // older should be true
        expect(result.hasMore).toEqual(getMockHasMore({newer: false}));
    });
  });

  describe('getUnreadPostsByGroupId()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should get from server if start post id is 0 and has more older is true', async () => {
      groupService.hasMorePostInRemote.mockResolvedValueOnce(
        getMockHasMore({}),
      );
      const localSpy = jest.spyOn(postFetchController, '_getUnreadPostsFromDb');
      const remoteSpy = jest.spyOn(
        postFetchController,
        'getRemotePostsByGroupId',
      );
      const result = await postFetchController.getUnreadPostsByGroupId({
        groupId: 1,
        startPostId: 0,
        endPostId: 2,
        unreadCount: 500,
      });
      expect(localSpy).not.toBeCalled();
      expect(remoteSpy).toBeCalledTimes(1);
    });

    it('should get from db if start post id is 0 and has more older is false', async () => {
      const mockPosts = postFactory.buildList(2);
      const mockItems = itemFactory.buildList(3);
      postDao.queryUnreadPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      groupService.hasMorePostInRemote.mockResolvedValueOnce({ older: false });
      const localSpy = jest.spyOn(postFetchController, '_getUnreadPostsFromDb');
      const remoteSpy = jest.spyOn(
        postFetchController,
        'getRemotePostsByGroupId',
      );
      const result = await postFetchController.getUnreadPostsByGroupId({
        groupId: 1,
        startPostId: 0,
        endPostId: 2,
        unreadCount: 500,
      });
      expect(localSpy).toBeCalled();
      expect(remoteSpy).not.toBeCalled();
      expect(result).toEqual({
        hasMore: getMockHasMore({}),
        items: mockItems,
        posts: mockPosts,
        limit: 500,
      });
    });

    it('should return [] if start post id is undefined', async () => {
      const result = await postFetchController.getUnreadPostsByGroupId({
        groupId: 1,
        startPostId: undefined,
        endPostId: 2,
        unreadCount: 500,
      });
      const localSpy = jest.spyOn(postFetchController, '_getUnreadPostsFromDb');
      const remoteSpy = jest.spyOn(
        postFetchController,
        'getRemotePostsByGroupId',
      );
      expect(localSpy).not.toBeCalled();
      expect(remoteSpy).not.toBeCalled();
      expect(result).toEqual({
        hasMore: getMockHasMore({}),
        items: [],
        posts: [],
        limit: 500,
      });
    });

    it('should just return local post when read through post in db', async () => {
      const mockPosts = postFactory.buildList(2);
      const mockItems = itemFactory.buildList(3);
      postDao.queryUnreadPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(true);
      const result = await postFetchController.getUnreadPostsByGroupId({
        groupId: 1,
        startPostId: 1,
        endPostId: 2,
        unreadCount: 500,
      });

      expect(result).toEqual({
        hasMore: getMockHasMore({}),
        items: mockItems,
        posts: mockPosts,
        limit: 500,
      });
    });

    it('should return server result when read through post not in db and not has more older', async () => {
      const mockPosts = postFactory.buildList(2);
      const mockItems = itemFactory.buildList(3);
      groupService.hasMorePostInRemote.mockResolvedValueOnce({ older: false });
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(false);
      itemService.getByPosts.mockResolvedValue(mockItems);
      const remoteSpy = jest.spyOn(
        postFetchController,
        'getRemotePostsByGroupId',
      );
      remoteSpy.mockResolvedValueOnce({
        success: true,
        hasMore: false,
        posts: mockPosts,
        items: mockItems,
      });
      itemService.handleIncomingData = jest
        .fn()
        .mockResolvedValueOnce(mockItems);

      const result = await postFetchController.getUnreadPostsByGroupId({
        groupId: 1,
        startPostId: 1,
        endPostId: 2,
        unreadCount: 500,
      });
      expect(remoteSpy).toBeCalledTimes(1);
      expect(result).toEqual({
        hasMore: getMockHasMore({ newer: false }),
        items: mockItems,
        posts: mockPosts,
        limit: 500,
      });
    });

    it('should return [] when read through post not in db and not newer in server', async () => {
      groupService.hasMorePostInRemote.mockResolvedValueOnce({ older: true });
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(false);
      itemService.getByPosts.mockResolvedValue([]);
      const remoteSpy = jest.spyOn(
        postFetchController,
        'getRemotePostsByGroupId',
      );
      remoteSpy.mockResolvedValueOnce({
        success: true,
        hasMore: false,
        posts: [],
        items: [],
      });
      itemService.handleIncomingData = jest.fn().mockResolvedValueOnce([]);

      const result = await postFetchController.getUnreadPostsByGroupId({
        groupId: 1,
        startPostId: 1,
        endPostId: 2,
        unreadCount: 500,
      });
      expect(remoteSpy).toBeCalledTimes(1);
      expect(result).toEqual({
        hasMore: getMockHasMore({ newer: false }),
        items: [],
        posts: [],
        limit: 500,
      });
    });

    it('should call getRemotePostsByGroupId with shouldSaveToDb as true', async () => {
      groupService.hasMorePostInRemote.mockResolvedValueOnce({ older: true });
      const mockPosts = postFactory.buildList(2);
      const mockItems = itemFactory.buildList(3);
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(false);
      itemService.getByPosts.mockResolvedValue(mockItems);
      const getRemotePostsSpy = jest.spyOn(
        postFetchController,
        'getRemotePostsByGroupId',
      );

      getRemotePostsSpy.mockResolvedValueOnce({
        success: true,
        hasMore: false,
        posts: mockPosts,
        items: mockItems,
      });
      itemService.handleIncomingData = jest
        .fn()
        .mockResolvedValueOnce(mockItems);

      const result = await postFetchController.getUnreadPostsByGroupId({
        groupId: 1,
        startPostId: 1,
        endPostId: 2,
        unreadCount: 500,
      });
      expect(getRemotePostsSpy).toBeCalledWith({
        groupId: 1,
        limit: 1000,
        postId: 1,
        direction: QUERY_DIRECTION.NEWER,
        shouldSaveToDb: true,
      });
    });

    it('should return newer and older result when read through post not in db and has more older', async () => {
      const mockPosts = postFactory.buildList(2);
      const mockItems = itemFactory.buildList(3);
      groupService.hasMorePostInRemote.mockResolvedValueOnce({ older: true });
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(false);
      itemService.getByPosts.mockResolvedValue(mockItems);
      const remoteSpy = jest.spyOn(
        postFetchController,
        'getRemotePostsByGroupId',
      );
      remoteSpy.mockResolvedValue({
        success: true,
        hasMore: false,
        posts: mockPosts,
        items: mockItems,
      });
      itemService.handleIncomingData = jest
        .fn()
        .mockResolvedValueOnce(mockItems);

      const result = await postFetchController.getUnreadPostsByGroupId({
        groupId: 1,
        startPostId: 1,
        endPostId: 2,
        unreadCount: 500,
      });
      expect(remoteSpy).toBeCalledTimes(2);
      expect(result).toEqual({
        hasMore: getMockHasMore({ newer: false, older: false }),
        items: [...mockItems, ...mockItems],
        posts: [...mockPosts, ...mockPosts],
        limit: 500,
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
      expect(groupService.handleGroupFetchedPosts).toBeCalled();
      expect(result.hasMore).toBeFalsy();
    });
  });
});
