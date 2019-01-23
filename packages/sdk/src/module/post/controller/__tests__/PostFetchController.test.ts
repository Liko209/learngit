/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-23 09:04:37
 * Copyright © RingCentral. All rights reserved.
 */

import { postFactory, itemFactory } from '../../../../__tests__/factories';
import { ItemService } from '../../../item';
import { PostDao, ItemDao, GroupConfigDao, daoManager } from '../../../../dao';
import { ExtendedBaseModel } from '../../../models';
import { IPreInsertController } from '../../../common/controller/interface/IPreInsertController';
import { PostFetchController } from '../PostFetchController';
import { PROGRESS_STATUS } from '../../../progress';
import PostAPI from '../../../../api/glip/post';
import { ApiResultOk, ApiResultErr } from '../../../../api/ApiResult';
import { BaseResponse, JNetworkError, ERROR_CODES_NETWORK } from 'foundation';

jest.mock('../../../../dao');
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
  const groupConfigDao = new GroupConfigDao(null);
  const preInsertController = new MockPreInsertController();
  const postFetchController = new PostFetchController(
    preInsertController,
    null,
  );

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  function setup() {
    ItemService.getInstance = jest.fn().mockReturnValue(itemService);
    itemService.handleIncomingData = jest.fn();
    daoManager.getDao.mockImplementation(arg => {
      if (arg === PostDao) {
        return postDao;
      }
      if (arg === ItemDao) {
        return itemDao;
      }
      if (arg === GroupConfigDao) {
        return groupConfigDao;
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

    it('should return empty result when shouldSaveToDb===true & local & remote is empty', async () => {
      const mockPosts = [];
      const mockItems = [];
      const mockNormal = new ApiResultOk({ posts: [], items: [] }, {
        status: 200,
        headers: {},
      } as BaseResponse);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      PostAPI.requestPosts.mockResolvedValue(mockNormal);

      const result = await await postFetchController.getPostsByGroupId({
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

    it('should return local + server result when shouldSaveToDb===true & local count < limit', async () => {
      const mockPosts = [{ id: 1 }, { id: 2 }];
      const mockItems = [{ id: 11 }, { id: 22 }];
      const data = {
        posts: [{ id: 3 }, { id: 4 }],
        items: [{ id: 12 }, { id: 23 }],
      };
      const mockNormal = new ApiResultOk(data, {
        status: 200,
        headers: {},
      } as BaseResponse);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      PostAPI.requestPosts.mockResolvedValue(mockNormal);
      itemService.handleIncomingData = jest
        .fn()
        .mockResolvedValueOnce(data.items);

      const result = await await postFetchController.getPostsByGroupId({
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

    it('should return empty result when shouldSaveToDb===true & local remote is empty & api request is failed', async () => {
      const mockPosts = [];
      const mockItems = [];
      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(true);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);
      PostAPI.requestPosts.mockResolvedValueOnce(
        new ApiResultErr(
          new JNetworkError(ERROR_CODES_NETWORK.GENERAL, 'error'),
            {
              status: 403,
              headers: {},
            } as BaseResponse,
        ),
      );

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
      const mockNormal = new ApiResultOk(data, {
        status: 200,
        headers: {},
      } as BaseResponse);

      jest.spyOn(postFetchController, '_isPostInDb').mockReturnValueOnce(false);
      itemService.handleIncomingData = jest
        .fn()
        .mockResolvedValueOnce(data.items);

      PostAPI.requestPosts.mockResolvedValue(mockNormal);
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
  });

  // describe('getPostsFromRemote()', () => {
  //   beforeEach(() => {
  //     clearMocks();
  //     setup();
  //   });

  //   it('should return posts', async () => {
  //     const data = {
  //       posts: [{ _id: 1 }, { _id: 2 }],
  //       items: [{ _id: 11 }, { _id: 22 }],
  //     };
  //     const mockNormal = new ApiResultOk(data, {
  //       status: 200,
  //       headers: {},
  //     } as BaseResponse);
  //     PostAPI.requestPosts.mockResolvedValue(mockNormal);
  //     groupService.getById.mockResolvedValue({
  //       most_recent_post_created_at: 2,
  //     });
  //     const result = await postService.getPostsFromRemote({
  //       groupId: 1,
  //       postId: 11,
  //       limit: 20,
  //     });
  //     expect(result).toEqual({
  //       posts: data.posts,
  //       items: data.items,
  //       hasMore: false,
  //     });
  //   });

  //   it('should handle offset/limit', async () => {
  //     const data = {
  //       posts: [{ _id: 1 }, { _id: 2 }],
  //       items: [{ _id: 11 }, { _id: 22 }],
  //     };
  //     const mockHasMore = new ApiResultOk(data, {
  //       status: 200,
  //       headers: {},
  //     } as BaseResponse);
  //     PostAPI.requestPosts.mockResolvedValue(mockHasMore);
  //     groupService.getById.mockResolvedValue({
  //       most_recent_post_created_at: 2,
  //     });
  //     const resultHasMore = await postService.getPostsFromRemote({
  //       groupId: 1,
  //       postId: 11,
  //       limit: 2,
  //     });
  //     expect(resultHasMore).toEqual({
  //       posts: data.posts,
  //       items: data.items,
  //       hasMore: true,
  //     });
  //   });

  //   it('should return remote posts', async () => {
  //     // test not postId
  //     const data = {
  //       posts: [{ _id: 1 }, { _id: 2 }],
  //       items: [{ _id: 11 }, { _id: 22 }],
  //     };
  //     const mockNotPostId = new ApiResultOk(data, {
  //       status: 200,
  //       headers: {},
  //     } as BaseResponse);
  //     PostAPI.requestPosts.mockResolvedValue(mockNotPostId);
  //     groupService.getById.mockResolvedValue({
  //       most_recent_post_created_at: 2,
  //     });
  //     const resultNotPostId = await postService.getPostsFromRemote({
  //       groupId: 1,
  //       limit: 2,
  //     });
  //     expect(resultNotPostId).toEqual({
  //       posts: data.posts,
  //       items: data.items,
  //       hasMore: true,
  //     });
  //   });

  //   it('should return [] when no matched', async () => {
  //     PostAPI.requestPosts.mockResolvedValue(
  //       new ApiResultOk({ posts: [], items: [] }, {
  //         status: 200,
  //         headers: {},
  //       } as BaseResponse),
  //     );
  //     groupService.getById.mockResolvedValue({ most_recent_post_id: 2 });
  //     const resultNull = await postService.getPostsFromRemote({
  //       groupId: 1,
  //       limit: 2,
  //     });
  //     expect(resultNull).toEqual({
  //       posts: [],
  //       items: [],
  //       hasMore: false,
  //     });
  //   });

  //   it('should throw if request failed', async () => {
  //     groupService.getById.mockResolvedValue({
  //       most_recent_post_created_at: 1,
  //     });
  //     PostAPI.requestPosts.mockRejectedValueOnce({});
  //     await expect(
  //       postService.getPostsFromRemote({
  //         groupId: 1,
  //         postId: 1,
  //         limit: 1,
  //       }),
  //     ).rejects.toBeDefined();
  //   });
  // });

  // describe('getPostsByGroupId()', () => {
  //   beforeEach(() => {
  //     clearMocks();
  //     ItemService.getInstance = jest.fn().mockReturnValue(itemService);
  //     jest.spyOn(postService, 'getPostsFromLocal');
  //     jest.spyOn(postService, 'getPostsFromRemote');
  //     jest.spyOn(postService, 'includeNewest').mockResolvedValue(true);
  //     jest.spyOn(postService, 'isNewestSaved').mockResolvedValue(true);
  //     jest.spyOn(postService, 'getById').mockResolvedValue({});
  //     daoManager.getDao.mockReturnValueOnce(groupConfigDao);
  //     groupConfigDao.hasMoreRemotePost.mockResolvedValueOnce(true);
  //   });

  //   it('should save and not check newest if incoming includes newest', async () => {
  //     postService.getPostsFromLocal.mockResolvedValueOnce({
  //       posts: [{ id: 1 }, { id: 2 }],
  //       items: [],
  //       hasMore: true,
  //     });

  //     postService.getPostsFromRemote.mockResolvedValueOnce({
  //       posts: [{ id: 1 }, { id: 2 }],
  //       items: [],
  //       hasMore: false,
  //     });

  //     await postService.getPostsByGroupId({
  //       groupId: 1,
  //     });

  //     expect(baseHandleData.mock.calls[0][1]).toBe(true);
  //     expect(postService.isNewestSaved).not.toHaveBeenCalled();
  //   });

  //   it('should save if newest is saved', async () => {
  //     postService.includeNewest.mockResolvedValue(false);
  //     postService.getPostsFromLocal.mockResolvedValueOnce({
  //       posts: [{ id: 1 }, { id: 2 }],
  //       items: [],
  //       hasMore: true,
  //     });

  //     postService.getPostsFromRemote.mockResolvedValueOnce({
  //       posts: [{ id: 1 }, { id: 2 }],
  //       items: [],
  //       hasMore: false,
  //     });

  //     await postService.getPostsByGroupId({
  //       groupId: 1,
  //     });

  //     expect(baseHandleData.mock.calls[0][1]).toBe(true);
  //     expect(postService.isNewestSaved).toHaveBeenCalled();
  //   });

  //   it('should not save if newest is not saved and incoming do not include newest', async () => {
  //     postService.includeNewest.mockResolvedValue(false);
  //     postService.isNewestSaved.mockResolvedValue(false);

  //     postService.getPostsFromLocal.mockResolvedValueOnce({
  //       posts: [{ id: 1 }, { id: 2 }],
  //       items: [],
  //       hasMore: true,
  //     });

  //     postService.getPostsFromRemote.mockResolvedValueOnce({
  //       posts: [{ id: 1 }, { id: 2 }],
  //       items: [],
  //       hasMore: false,
  //     });

  //     await postService.getPostsByGroupId({
  //       groupId: 1,
  //     });

  //     expect(baseHandleData.mock.calls[0][1]).toBe(false);
  //   });

  //   it('should return local data', async (done: any) => {
  //     /**
  //      * We have 2 posts total at local, 0 at remote.
  //      */
  //     postService.getPostsFromLocal.mockResolvedValueOnce({
  //       posts: [{ id: 1 }, { id: 2 }],
  //       items: [],
  //       hasMore: true,
  //     });

  //     postService.getPostsFromRemote.mockResolvedValueOnce({
  //       posts: [],
  //       items: [],
  //       hasMore: false,
  //     });

  //     const resultEmpty = await postService.getPostsByGroupId({
  //       groupId: 1,
  //     });

  //     setTimeout(() => {
  //       expect(postService.getPostsFromLocal).toHaveBeenCalledWith({
  //         groupId: 1,
  //         limit: 20,
  //         direction: 'older',
  //         postId: 0,
  //       });
  //       expect(resultEmpty).toEqual({
  //         items: [],
  //         posts: [{ id: 1 }, { id: 2 }],
  //         hasMore: false,
  //         limit: 20,
  //       });
  //       done();
  //     });
  //   });

  //   it('should return remote data', async () => {
  //     /**
  //      * 2 posts total, 2 at remote, 0 at local.
  //      */
  //     postService.getPostsFromLocal.mockResolvedValueOnce({
  //       posts: [],
  //       items: [],
  //       hasMore: true,
  //     });
  //     postService.getPostsFromRemote.mockResolvedValueOnce({
  //       posts: [{ _id: 1 }, { _id: 2 }],
  //       items: [],
  //       hasMore: false,
  //     });

  //     baseHandleData.mockResolvedValue([{ id: 1 }, { id: 2 }]);
  //     itemService.handleIncomingData.mockResolvedValue([]);

  //     const result = await postService.getPostsByGroupId({
  //       groupId: 1,
  //       limit: 20,
  //     });
  //     expect(result).toEqual({
  //       posts: [{ id: 1 }, { id: 2 }],
  //       items: [],
  //       hasMore: false,
  //       limit: 20,
  //     });
  //   });

  //   it('should return local+remote data when localData + remoteData < pageSize', async () => {
  //     /**
  //      * 4 posts total, 2 at local, 2 at remote.
  //      * When pageSize is 20, it should return all 4 posts.
  //      */
  //     postService.getPostsFromLocal.mockResolvedValueOnce({
  //       posts: [{ id: 1 }, { id: 2 }],
  //       items: [],
  //       hasMore: true,
  //     });
  //     postService.getPostsFromRemote.mockResolvedValueOnce({
  //       posts: [{ _id: 3 }, { _id: 4 }],
  //       items: [],
  //       hasMore: false,
  //     });
  //     baseHandleData.mockResolvedValue([{ id: 3 }, { id: 4 }]);
  //     itemService.handleIncomingData.mockResolvedValue([]);
  //     groupConfigDao.hasMoreRemotePost.mockResolvedValueOnce(true);
  //     groupConfigDao.update = jest.fn();
  //     const result = await postService.getPostsByGroupId({
  //       groupId: 1,
  //       limit: 20,
  //     });

  //     expect(result).toEqual({
  //       posts: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
  //       items: [],
  //       hasMore: false,
  //       limit: 20,
  //     });
  //   });

  //   it('should return local+remote data when localData + remoteData > pageSize', async () => {
  //     /**
  //      * 4 posts total, 2 of them at local, 2 at remote.
  //      * When pageSize is 3, it should return 3 posts (2 local + 1 remote).
  //      */
  //     postService.getPostsFromLocal.mockResolvedValueOnce({
  //       posts: [{ id: 1 }, { id: 2 }],
  //       items: [],
  //       hasMore: true,
  //     });
  //     postService.getPostsFromRemote.mockResolvedValueOnce({
  //       posts: [{ _id: 3 }],
  //       items: [],
  //       hasMore: false,
  //     });
  //     baseHandleData.mockResolvedValue([{ id: 3 }]);
  //     itemService.handleIncomingData.mockResolvedValue([]);

  //     const result = await postService.getPostsByGroupId({
  //       groupId: 1,
  //       limit: 3,
  //     });
  //     expect(result).toEqual({
  //       posts: [{ id: 1 }, { id: 2 }, { id: 3 }],
  //       items: [],
  //       hasMore: false,
  //       limit: 3,
  //     });
  //   });

  //   it('should throw error when error occur', async () => {
  //     jest.spyOn(postService, 'getPostsFromLocal').mockResolvedValueOnce({
  //       posts: [],
  //       items: [],
  //       hasMore: true,
  //       limit: 20,
  //     });
  //     const error = new JServerError(
  //       ERROR_CODES_SERVER.NOT_AUTHORIZED,
  //       'NOT_AUTHORIZED',
  //     );
  //     jest
  //       .spyOn(postService, 'getPostsFromRemote')
  //       .mockImplementationOnce(async () => {
  //         throw error;
  //       });

  //     try {
  //       await postService.getPostsByGroupId({
  //         groupId: 1,
  //         limit: 20,
  //       });
  //     } catch (e) {
  //       expect(e).toEqual(error);
  //     }
  //   });
  // });

  // describe('getPostsByGroupId()', () => {
  //   beforeEach(() => {
  //     clearMocks();
  //   });
  //   it('should get posts from db firstly if should save to db is true', async () => {
  //     const postController = new PostController();
  //   });
  // });
});
