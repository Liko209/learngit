/// <reference path="../../../__tests__/types.d.ts" />
import _ from 'lodash';
import {
  daoManager,
  PostDao,
  ItemDao,
  GroupConfigDao,
  AccountDao,
} from '../../../dao';
import PostAPI from '../../../api/glip/post';
import itemHandleData from '../../item/handleData';
import { baseHandleData } from '../handleData';
import ItemService from '../../item';
import PostService from '../index';
import PostServiceHandler from '../postServiceHandler';
import ProfileService from '../../profile';
import GroupService from '../../group';
import { postFactory, itemFactory } from '../../../__tests__/factories';
import { ApiResultOk, ApiResultErr } from '../../../api/ApiResult';
import { serviceErr, serviceOk } from '../../ServiceResult';
import { BaseError } from '../../../utils';
import notificationCenter from '../../notificationCenter';
import { SERVICE, ENTITY } from '../../eventKey';
import { Listener } from 'eventemitter2';
import { SENDING_STATUS } from '../../constants';
import { err, ok, BaseResponse } from 'foundation';

jest.mock('../../../dao');
jest.mock('../../../api/glip/post');
jest.mock('../../serviceManager');
jest.mock('../../item/handleData');
jest.mock('../../item');
jest.mock('../postServiceHandler');
jest.mock('../postStatusHandler');
jest.mock('../handleData');
jest.mock('../../profile');
jest.mock('../../group');
jest.mock('../../notificationCenter');

PostAPI.putDataById = jest.fn();
PostAPI.requestByIds = jest.fn();

describe('PostService', () => {
  const postService = new PostService();
  const groupService = new GroupService();
  const itemService = new ItemService();
  const profileService = new ProfileService();
  const postDao = new PostDao(null);
  const itemDao = new ItemDao(null);
  const groupConfigDao = new GroupConfigDao(null);
  const postMockInfo = postFactory.build({
    id: -1,
    created_at: 11111,
    modified_at: 11111,
    creator_id: 1,
    version: 2222,
    new_version: 2222,
    is_new: true,
    text: 'abc',
    group_id: 4,
    from_group_id: 4,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    ItemService.getInstance = jest.fn().mockReturnValue(itemService);
    ProfileService.getInstance = jest.fn().mockReturnValue(profileService);
    GroupService.getInstance = jest.fn().mockReturnValue(groupService);
    daoManager.getDao.mockReturnValueOnce(postDao);
    daoManager.getDao.mockReturnValueOnce(itemDao);
    daoManager.getDao.mockReturnValueOnce(groupConfigDao);
  });

  describe('getPostsFromLocal()', () => {
    it('should return posts', async () => {
      const mockPosts = postFactory.buildList(2);
      const mockItems = itemFactory.buildList(3);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);

      const result = await postService.getPostsFromLocal({
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

    it('should return empty result', async () => {
      const mockPosts = [];
      const mockItems = [];
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemService.getByPosts.mockResolvedValue(mockItems);

      const result = await postService.getPostsFromLocal({
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

  describe('getPostsFromRemote()', () => {
    it('should return posts', async () => {
      const data = {
        posts: [{ _id: 1 }, { _id: 2 }],
        items: [{ _id: 11 }, { _id: 22 }],
      };
      const mockNormal = new ApiResultOk(data, {
        status: 200,
        headers: {},
      } as BaseResponse);
      PostAPI.requestPosts.mockResolvedValue(mockNormal);
      groupService.getById.mockResolvedValue({
        most_recent_post_created_at: 2,
      });
      const result = await postService.getPostsFromRemote({
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

    it('should handle offset/limit', async () => {
      const data = {
        posts: [{ _id: 1 }, { _id: 2 }],
        items: [{ _id: 11 }, { _id: 22 }],
      };
      const mockHasMore = new ApiResultOk(data, {
        status: 200,
        headers: {},
      } as BaseResponse);
      PostAPI.requestPosts.mockResolvedValue(mockHasMore);
      groupService.getById.mockResolvedValue({
        most_recent_post_created_at: 2,
      });
      const resultHasMore = await postService.getPostsFromRemote({
        groupId: 1,
        postId: 11,
        limit: 2,
      });
      expect(resultHasMore).toEqual({
        posts: data.posts,
        items: data.items,
        hasMore: true,
      });
    });

    it('should return remote posts', async () => {
      // test not postId
      const data = {
        posts: [{ _id: 1 }, { _id: 2 }],
        items: [{ _id: 11 }, { _id: 22 }],
      };
      const mockNotPostId = new ApiResultOk(data, {
        status: 200,
        headers: {},
      } as BaseResponse);
      PostAPI.requestPosts.mockResolvedValue(mockNotPostId);
      groupService.getById.mockResolvedValue({
        most_recent_post_created_at: 2,
      });
      const resultNotPostId = await postService.getPostsFromRemote({
        groupId: 1,
        limit: 2,
      });
      expect(resultNotPostId).toEqual({
        posts: data.posts,
        items: data.items,
        hasMore: true,
      });
    });

    it('should return [] when no matched', async () => {
      PostAPI.requestPosts.mockResolvedValue(
        new ApiResultOk({ posts: [], items: [] }, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
      groupService.getById.mockResolvedValue({ most_recent_post_id: 2 });
      const resultNull = await postService.getPostsFromRemote({
        groupId: 1,
        limit: 2,
      });
      expect(resultNull).toEqual({
        posts: [],
        items: [],
        hasMore: false,
      });
    });

    it('should not send request if the group had no post', async () => {
      groupService.getById.mockResolvedValue({
        most_recent_post_created_at: undefined,
      });
      await postService.getPostsFromRemote({
        groupId: 1,
        limit: 2,
      });
      expect(PostAPI.requestPosts).not.toHaveBeenCalled();
    });

    it('should return hasMore = true if request failed', async () => {
      groupService.getById.mockResolvedValue({
        most_recent_post_created_at: 1,
      });
      PostAPI.requestPosts.mockRejectedValueOnce({});
      const result = await postService.getPostsFromRemote({
        groupId: 1,
        postId: 1,
        limit: 1,
      });
      expect(result.hasMore).toBe(true);
    });
  });

  describe('getPostsByGroupId()', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
      jest.resetAllMocks();
      jest.spyOn(postService, 'getPostsFromLocal');
      jest.spyOn(postService, 'getPostsFromRemote');
      jest.spyOn(postService, 'includeNewest').mockResolvedValue(true);
      jest.spyOn(postService, 'isNewestSaved').mockResolvedValue(true);
      jest.spyOn(postService, 'getById').mockResolvedValue({});
      daoManager.getDao.mockReturnValueOnce(groupConfigDao);
      groupConfigDao.hasMoreRemotePost.mockResolvedValueOnce(true);
    });

    it('should save and not check newest if incoming includes newest', async () => {
      postService.getPostsFromLocal.mockResolvedValueOnce({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: true,
      });

      postService.getPostsFromRemote.mockResolvedValueOnce({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: false,
      });

      await postService.getPostsByGroupId({
        groupId: 1,
      });

      expect(baseHandleData.mock.calls[0][1]).toBe(true);
      expect(postService.isNewestSaved).not.toHaveBeenCalled();
    });

    it('should save if newest is saved', async () => {
      postService.includeNewest.mockResolvedValue(false);
      postService.getPostsFromLocal.mockResolvedValueOnce({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: true,
      });

      postService.getPostsFromRemote.mockResolvedValueOnce({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: false,
      });

      await postService.getPostsByGroupId({
        groupId: 1,
      });

      expect(baseHandleData.mock.calls[0][1]).toBe(true);
      expect(postService.isNewestSaved).toHaveBeenCalled();
    });
    it('should not save if newest is not saved and incoming do not include newest', async () => {
      postService.includeNewest.mockResolvedValue(false);
      postService.isNewestSaved.mockResolvedValue(false);

      postService.getPostsFromLocal.mockResolvedValueOnce({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: true,
      });

      postService.getPostsFromRemote.mockResolvedValueOnce({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: false,
      });

      await postService.getPostsByGroupId({
        groupId: 1,
      });

      expect(baseHandleData.mock.calls[0][1]).toBe(false);
    });

    it('should return local data', async () => {
      /**
       * We have 2 posts total at local, 0 at remote.
       */
      postService.getPostsFromLocal.mockResolvedValueOnce({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: true,
      });

      postService.getPostsFromRemote.mockResolvedValueOnce({
        posts: [],
        items: [],
        hasMore: false,
      });

      const resultEmpty = await postService.getPostsByGroupId({
        groupId: 1,
      });

      expect(postService.getPostsFromLocal).toHaveBeenCalledWith({
        groupId: 1,
        limit: 20,
        direction: 'older',
        postId: 0,
      });
      expect(resultEmpty).toEqual({
        items: [],
        posts: [{ id: 1 }, { id: 2 }],
        hasMore: false,
        limit: 20,
      });
    });

    it('should return remote data', async () => {
      /**
       * 2 posts total, 2 at remote, 0 at local.
       */
      postService.getPostsFromLocal.mockResolvedValueOnce({
        posts: [],
        items: [],
        hasMore: true,
      });
      postService.getPostsFromRemote.mockResolvedValueOnce({
        posts: [{ _id: 1 }, { _id: 2 }],
        items: [],
        hasMore: false,
      });

      baseHandleData.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      itemHandleData.mockResolvedValue([]);

      const result = await postService.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });
      expect(result).toEqual({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: false,
        limit: 20,
      });
    });

    it('should return local+remote data when localData + remoteData < pageSize', async () => {
      /**
       * 4 posts total, 2 at local, 2 at remote.
       * When pageSize is 20, it should return all 4 posts.
       */
      postService.getPostsFromLocal.mockResolvedValueOnce({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: true,
      });
      postService.getPostsFromRemote.mockResolvedValueOnce({
        posts: [{ _id: 3 }, { _id: 4 }],
        items: [],
        hasMore: false,
      });
      baseHandleData.mockResolvedValue([{ id: 3 }, { id: 4 }]);
      itemHandleData.mockResolvedValue([]);
      groupConfigDao.hasMoreRemotePost.mockResolvedValueOnce(true);

      const result = await postService.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });
      expect(result).toEqual({
        posts: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        items: [],
        hasMore: false,
        limit: 20,
      });
    });

    it('should return local+remote data when localData + remoteData > pageSize', async () => {
      /**
       * 4 posts total, 2 of them at local, 2 at remote.
       * When pageSize is 3, it should return 3 posts (2 local + 1 remote).
       */
      postService.getPostsFromLocal.mockResolvedValueOnce({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: true,
      });
      postService.getPostsFromRemote.mockResolvedValueOnce({
        posts: [{ _id: 3 }],
        items: [],
        hasMore: false,
      });
      baseHandleData.mockResolvedValue([{ id: 3 }]);
      itemHandleData.mockResolvedValue([]);

      const result = await postService.getPostsByGroupId({
        groupId: 1,
        limit: 3,
      });
      expect(result).toEqual({
        posts: [{ id: 1 }, { id: 2 }, { id: 3 }],
        items: [],
        hasMore: false,
        limit: 3,
      });
    });

    it('should error case', async () => {
      postDao.queryPostsByGroupId.mockResolvedValue(null);
      const result = await postService.getPostsByGroupId({
        groupId: 1,
        limit: 20,
      });
      expect(result).toEqual({
        posts: [],
        items: [],
        hasMore: true,
        limit: 20,
      });
    });
  });

  describe('getPostsByIds', () => {
    beforeAll(() => {
      jest.spyOn(itemService, 'getByPosts');
      jest.spyOn(postDao, 'batchGet');
      jest.spyOn(PostAPI, 'requestByIds');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return local posts if exists', async () => {
      const localPosts = [{ id: 3 }, { id: 4 }, { id: 5 }];
      jest
        .spyOn(postService, 'getModelsLocally')
        .mockResolvedValue([...localPosts]);
      const result = await postService.getPostsByIds([3, 4, 5]);
      expect(result.posts).toEqual(localPosts);
    });

    it('should return local posts + remote posts if partly exists', async () => {
      const localPosts = [{ id: 3 }, { id: 4 }, { id: 5 }];
      const remotePosts = [{ id: 1 }, { id: 2 }];
      jest
        .spyOn(postService, 'getModelsLocally')
        .mockResolvedValue([...localPosts]);

      const data = { posts: [...remotePosts], items: [] };
      PostAPI.requestByIds.mockResolvedValue(
        new ApiResultOk(data, { status: 200, headers: {} } as BaseResponse),
      );
      baseHandleData.mockImplementationOnce((data: any) => data);
      itemService.getByPosts.mockResolvedValue([]);
      const result = await postService.getPostsByIds([1, 2, 3, 4, 5]);
      expect(result.posts.map(({ id }) => id).sort()).toEqual(
        [...remotePosts, ...localPosts].map(({ id }) => id).sort(),
      );
    });

    it('should return items get with itemService for local posts', async () => {
      const localPosts = [{ id: 3 }, { id: 4 }, { id: 5 }];
      itemService.getByPosts.mockResolvedValue([
        { id: 100 },
        { id: 101 },
        { id: 102 },
      ]);
      jest
        .spyOn(postService, 'getModelsLocally')
        .mockResolvedValue([...localPosts]);
      const result = await postService.getPostsByIds([3, 4, 5]);
      expect(result.items).toEqual([{ id: 100 }, { id: 101 }, { id: 102 }]);
    });

    it('should push remote items to existing items', async () => {
      const localPosts = [{ id: 3 }, { id: 4 }, { id: 5 }];
      const remotePosts = [{ id: 1 }, { id: 2 }];
      itemService.getByPosts.mockResolvedValue([
        { id: 100 },
        { id: 101 },
        { id: 102 },
      ]);
      jest
        .spyOn(postService, 'getModelsLocally')
        .mockResolvedValue([...localPosts]);
      const data = {
        posts: [...remotePosts],
        items: [{ id: 103 }, { id: 104 }],
      };
      PostAPI.requestByIds.mockResolvedValue(
        new ApiResultOk(data, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
      baseHandleData.mockImplementationOnce((data: any) => data);
      itemHandleData.mockImplementationOnce((data: any) => data);
      const result = await postService.getPostsByIds([1, 2, 3, 4, 5]);
      expect(result.items).toEqual([
        { id: 100 },
        { id: 101 },
        { id: 102 },
        { id: 103 },
        { id: 104 },
      ]);
    });
  });

  describe('sendPost()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should send', async () => {
      jest.spyOn(postService, 'innerSendPost');
      postService.innerSendPost.mockResolvedValueOnce([
        { id: 10, data: 'good' },
      ]);
      await postService.sendPost({ text: 'test' });
      expect(PostServiceHandler.buildPostInfo).toHaveBeenCalledWith({
        text: 'test',
      });
      postService.innerSendPost.mockRestore();
    });

    it('should throw error', async () => {
      const response = { data: { id: 1, text: 'abc' } };
      PostAPI.sendPost.mockResolvedValue(null);
      PostServiceHandler.buildPostInfo.mockResolvedValueOnce({
        id: 1,
        text: 'abc',
      });
      await expect(
        postService.sendPost({
          text: response.data.text,
        }),
      ).rejects.toThrow();
    });

    it('should send post success', async () => {
      GroupService.getInstance = jest.fn().mockReturnValue(groupService);
      groupService.getGroupSendFailurePostIds.mockResolvedValue([]);
      daoManager.getDao.mockReturnValue(postDao);
      postDao.put.mockImplementation(() => {});

      const info = _.cloneDeep(postMockInfo);
      const responseData = _.cloneDeep(postMockInfo);
      responseData.id = 99999;

      itemService.cleanUploadingFiles = jest.fn();

      PostServiceHandler.buildPostInfo.mockResolvedValueOnce(info);
      PostAPI.sendPost.mockResolvedValueOnce(
        new ApiResultOk(responseData, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );

      const results = await postService.sendPost({ text: 'abc' });
      expect(results[0].id).toEqual(-1);
      expect(results[0].data.id).toEqual(99999);
      expect(results[0].data.text).toEqual('abc');
    });

    it('should send post fail', async () => {
      const info = _.cloneDeep(postMockInfo);
      PostServiceHandler.buildPostInfo.mockResolvedValueOnce(info);
      PostAPI.sendPost.mockResolvedValueOnce({ data: { error: {} } });
      await expect(postService.sendPost({ text: 'abc' })).rejects.toThrow();
    });
  });

  describe('modifyPost()', () => {
    it('should return null when postId no given', async () => {
      const result = await postService.modifyPost({ text: 'abc' });
      expect(result).toBeNull();
    });

    it('should call PostAPI.editPost()', async () => {
      PostServiceHandler.buildModifiedPostInfo.mockResolvedValue({});
      PostAPI.editPost.mockResolvedValueOnce(
        new ApiResultOk({}, { status: 200, headers: {} } as BaseResponse),
      );
      baseHandleData.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);

      const result = await postService.modifyPost({ postId: 1, text: 'abc' });

      expect(PostAPI.editPost).toHaveBeenCalledWith(1, {});
      expect(result).toEqual({ id: 1 });
    });
    it('should return null when error', async () => {
      PostServiceHandler.buildModifiedPostInfo.mockReturnValueOnce(
        new Error('mock error'),
      );
      const result = await postService.modifyPost({ postId: 1, text: 'abc' });
      expect(result).toBeNull();
    });
  });

  describe('like post', () => {
    beforeAll(() => {
      postService.getById = jest.fn();
    });
    it('should return null when post id is negative', async () => {
      postService.getById.mockResolvedValueOnce(null);
      const result = await postService.likePost(-1, 101, true);
      expect(result.isErr()).toBe(true);
    });
    it('should return null when post is not exist', async () => {
      postService.getById.mockResolvedValueOnce(null);
      const result = await postService.likePost(100, 101, true);
      expect(result.isErr()).toBe(true);
    });
    it('should return old post if person id is in post likes when to like', async () => {
      const post = { id: 100, likes: [] };
      postService.getById.mockResolvedValue(post);
      const data = { _id: 100, likes: [101] };
      PostAPI.putDataById.mockResolvedValueOnce(
        new ApiResultOk(data, { status: 200, headers: {} } as BaseResponse),
      );
      baseHandleData.mockResolvedValueOnce([{ id: 100, likes: [101] }]);
      const result = await postService.likePost(100, 101, true);
      expect(result.isOk()).toBe(true);
      expect(result.data.likes).toEqual([101]);
      // expect(post.likes).toEqual([101]);
    });
    it('should return old post if person id is not in post likes when to unlike', async () => {
      const post = { id: 100, likes: [] };
      postService.getById.mockResolvedValue(post);
      const result = await postService.likePost(100, 102, false);
      expect(result.data.likes).toEqual([]);
    });
    it('should return new post if person id is in post likes when to like', async () => {
      const post = { id: 100, likes: [] };
      postService.getById.mockResolvedValue(post);
      const result = await postService.likePost(100, 101, true);
      expect(result.data.likes).toEqual([101]);
    });

    it('should return new post if person id is in post likes when to unlike', async () => {
      const postInDao = { id: 100, likes: [101, 102] };
      const postInApi = { _id: 100, likes: [102] };
      postService.getById.mockResolvedValue(postInDao);
      PostAPI.putDataById.mockResolvedValueOnce({
        data: postInApi,
      });

      baseHandleData.mockResolvedValueOnce([{ id: 100, likes: [102] }]);
      const result = await postService.likePost(100, 101, false);
      expect(result.data.likes).toEqual([102]);
    });

    it('should return error when server error', async () => {
      postService.getById.mockResolvedValueOnce({ id: 100, likes: [101, 102] });
      PostAPI.putDataById.mockResolvedValueOnce({
        error: { _id: 100, likes: [102] },
      });
      const result = await postService.likePost(100, 101, false);
      expect(result.isErr()).toBe(true);
    });
  });

  describe('deletePost()', () => {
    it('should return null when post id is negative', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      const result = await postService.deletePost(-1);
      // todo the reason to return false is post id === -1?
      expect(result).toBe(false);
    });
    it('should return post', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({
        id: 100,
      });
      PostAPI.putDataById.mockResolvedValueOnce(
        new ApiResultOk({ id: 100, deactivated: true }, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
      baseHandleData.mockResolvedValueOnce([{ id: 100, deactivated: true }]);
      const result = await postService.deletePost(100);
      // todo expect result equal true dose make any sense? seems just for test to write test.
      expect(result).toEqual(true);
    });
    it('should return post null when post not exist in local', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce(null);
      const result = await postService.deletePost(100);
      expect(result).toEqual(false);
    });

    it('should return post null when post server error', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({
        id: 100,
      });
      PostAPI.putDataById.mockResolvedValueOnce({
        data: { error: { error_code: 400 } },
      });
      baseHandleData.mockResolvedValueOnce([{ id: 100, deactivated: true }]);
      await expect(postService.deletePost(100)).rejects.toThrowError();
    });
    it('should work when post isInPreInsert', async () => {
      // do some mock
      daoManager.getDao.mockReturnValueOnce(postDao);
      jest.spyOn(postService, 'isInPreInsert').mockReturnValueOnce(true);
      jest
        .spyOn(postDao, 'get')
        .mockReturnValueOnce(postFactory.build({ id: 100 }));
      groupService.getGroupSendFailurePostIds.mockResolvedValueOnce([100]);

      const result = await postService.deletePost(100);

      expect(result).toBeTruthy();
      expect(notificationCenter.emitEntityDelete).toBeCalledWith(ENTITY.POST, [
        100,
      ]);
      expect(postDao.delete).toBeCalled();
      expect(groupService.getGroupSendFailurePostIds).toBeCalled();
      // find failure ids then delete
      // then updateGroupSendFailurePostIds
      expect(groupService.updateGroupSendFailurePostIds).toBeCalled();
    });
  });

  describe('bookMark Post', () => {
    it('book post should return serviceErr', async () => {
      profileService.putFavoritePost.mockResolvedValueOnce(serviceErr(500, ''));
      const result = await postService.bookmarkPost(1, true);
      expect(result.isErr()).toBe(true);
    });
    it('book post should return serviceOk', async () => {
      profileService.putFavoritePost.mockResolvedValueOnce(serviceOk({}));
      const result = await postService.bookmarkPost(1, true);
      expect(result.isOk()).toBe(true);
    });
  });

  describe('reSendPost()', async () => {
    it('positive id should not resend', async () => {
      const result = await postService.reSendPost(1);
      expect(result).toBeNull();
    });
    it('negative id should resend', async () => {
      postDao.get.mockResolvedValueOnce(null);
      const result = await postService.reSendPost(-1);
      expect(result).toBeNull();
    });

    it('negative id with post should resend success', async () => {
      jest.spyOn(postService, 'innerSendPost');
      jest.spyOn(postService, 'isInPreInsert');
      postService.innerSendPost.mockResolvedValueOnce([
        { id: 10, data: 'good' },
      ]);
      postService.isInPreInsert.mockResolvedValueOnce(true);
      postDao.get.mockResolvedValueOnce({ id: -1, text: 'good' });
      const result = await postService.reSendPost(-1);
      expect(result[0].data).toBe('good');
      jest.clearAllMocks();
    });
  });

  describe('groupHasPostInLocal', async () => {
    it('has post in local', async () => {
      postDao.queryPostsByGroupId.mockResolvedValueOnce([{ id: 1 }]);
      const result = await postService.groupHasPostInLocal(1);
      expect(result).toBe(true);
    });
    it('has not post in local', async () => {
      postDao.queryPostsByGroupId.mockResolvedValueOnce([]);
      const result = await postService.groupHasPostInLocal(1);
      expect(result).toBe(false);
    });
  });

  describe('getNewestPostIdOfGroup', async () => {
    it('should return api result if success', async () => {
      const data = { posts: [{ _id: 123 }] };
      PostAPI.requestPosts.mockResolvedValue(
        new ApiResultOk(data, { status: 200, headers: {} } as BaseResponse),
      );

      await expect(postService.getNewestPostIdOfGroup(1)).resolves.toBe(123);
    });

    it('should return null if api result is empty', async () => {
      PostAPI.requestPosts.mockResolvedValue(
        new ApiResultOk({ posts: [] }, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );

      await expect(postService.getNewestPostIdOfGroup(1)).resolves.toBe(null);
    });

    it('should return null if error', async () => {
      PostAPI.requestPosts.mockRejectedValue(
        new ApiResultErr(new BaseError(500, ''), {
          status: 500,
          headers: {},
        } as BaseResponse),
      );

      await expect(postService.getNewestPostIdOfGroup(1)).resolves.toBe(null);
    });
  });

  describe('includeNewest', () => {
    it('should return false if no newest post', async () => {
      postService.getNewestPostIdOfGroup = jest.fn().mockResolvedValue(null);

      await expect(postService.includeNewest([], 1)).resolves.toBe(false);
    });

    it('should return true if newest post id in in the array', async () => {
      postService.getNewestPostIdOfGroup = jest.fn().mockResolvedValue(12);
      await expect(postService.includeNewest([1, 2, 12], 1)).resolves.toBe(
        true,
      );
    });

    it('should return false if newest post id not in in the array', async () => {
      postService.getNewestPostIdOfGroup = jest.fn().mockResolvedValue(12);
      await expect(postService.includeNewest([1, 2], 1)).resolves.toBe(false);
    });
  });

  describe('isNewestSaved', () => {
    beforeEach(() => {
      daoManager.getDao = jest.fn().mockReturnValueOnce(groupConfigDao);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return true if it is true in db', async () => {
      jest.spyOn(groupConfigDao, 'isNewestSaved').mockResolvedValue(true);
      await expect(postService.isNewestSaved(1)).resolves.toBe(true);
    });

    it('should return false if local data is false and no newest post', async () => {
      jest.spyOn(groupConfigDao, 'isNewestSaved').mockResolvedValue(false);
      postService.getNewestPostIdOfGroup = jest.fn().mockResolvedValue(null);
      await expect(postService.isNewestSaved(1)).resolves.toBe(false);
    });

    it('should return true and update if newest post in db', async () => {
      jest.spyOn(groupConfigDao, 'isNewestSaved').mockResolvedValue(false);
      jest.spyOn(groupConfigDao, 'update');
      postService.getNewestPostIdOfGroup = jest.fn().mockResolvedValue(123);
      postDao.get = jest.fn().mockResolvedValue({});
      daoManager.getDao.mockReturnValueOnce(postDao);
      const result = await postService.isNewestSaved(1);
      expect(result).toBe(true);
      expect(groupConfigDao.update).toHaveBeenCalledWith({
        id: 1,
        is_newest_saved: true,
      });
    });

    it('should return false and update if newest post is not in db', async () => {
      jest.spyOn(groupConfigDao, 'isNewestSaved').mockResolvedValue(false);
      jest.spyOn(groupConfigDao, 'update');
      postService.getNewestPostIdOfGroup = jest.fn().mockResolvedValue(123);
      postDao.get = jest.fn().mockResolvedValue(null);
      daoManager.getDao.mockReturnValueOnce(postDao);
      const result = await postService.isNewestSaved(1);
      expect(result).toBe(false);
      expect(groupConfigDao.update).toHaveBeenCalledWith({
        id: 1,
        is_newest_saved: false,
      });
    });
  });
  describe('newMessageWithPeopleIds', async () => {
    const accountDao = new AccountDao(null);
    daoManager.getKVDao.mockReturnValue(accountDao);
    accountDao.get.mockReturnValue(1); // userId
    it.skip('should get group success then send post', async () => {
      const g = { id: 44 };
      groupService.getOrCreateGroupByMemberList.mockResolvedValue(g);

      const msg = '  text message  ';
      const spy = jest.spyOn(postService, 'sendPost');
      spy.mockResolvedValue([{ id: 10, data: 'good' }]);
      const result = await postService.newMessageWithPeopleIds([1, 2, 3], msg);

      expect(spy).toBeCalledWith({ groupId: g.id, text: msg });
      expect(result).toEqual({ id: 44 });
    });

    it('should not call send post when get group failed', async () => {
      const spy = jest.spyOn(postService, 'sendPost');
      groupService.getOrCreateGroupByMemberList.mockResolvedValue(
        err(new BaseError(500, '')),
      );
      const result = await postService.newMessageWithPeopleIds(
        [1, 2, 3],
        'text message',
      );
      expect(spy).not.toBeCalled();
      expect(result.isOk()).toBe(false);
    });

    it('should not call send post when send empty message ', async () => {
      const g = { id: 44 };
      groupService.getOrCreateGroupByMemberList.mockResolvedValue(ok(g));
      jest.spyOn(postService, 'sendPost');

      let result = await postService.newMessageWithPeopleIds([1, 2, 3], '   ');
      expect(result.data).toEqual({ id: 44 });
      result = await postService.newMessageWithPeopleIds([1, 2, 3], '');
      expect(result.data).toEqual({ id: 44 });

      expect(postService.sendPost).not.toBeCalled();
    });
  });

  describe('cancelUpload', async () => {
    it('should call partial update once ', async () => {
      jest
        .spyOn(postService, 'handlePartialUpdate')
        .mockImplementation(() => {});

      await postService.cancelUpload(1, 1);

      expect(postService.handlePartialUpdate).toBeCalledTimes(1);
    });
  });

  describe('send post with pseudo items', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      jest.restoreAllMocks();

      ItemService.getInstance = jest.fn().mockReturnValue(itemService);
      itemService.cleanUploadingFiles.mockImplementation(() => {});
      daoManager.getDao.mockReturnValue(postDao);
      postDao.update.mockImplementation(() => {});
    });

    it('should resend failed items and then send post', async (done: jest.DoneCallback) => {
      const info = _.cloneDeep(postMockInfo);
      info.item_ids = [-1, 3];
      PostServiceHandler.buildResendPostInfo.mockReturnValueOnce(info);
      postDao.get.mockResolvedValue({ id: 1 });

      const spyIsInPreInsert = jest.spyOn(postService, 'isInPreInsert');
      spyIsInPreInsert.mockReturnValue(true);

      const spyHandlePreInsertProcess = jest.spyOn(
        postService,
        '_handlePreInsertProcess',
      );
      spyHandlePreInsertProcess.mockImplementation(() => {});

      const spySendPostWithPreInsertItems = jest.spyOn(
        postService,
        '_sendPostWithPreInsertItems',
      );
      spySendPostWithPreInsertItems.mockImplementation(() => {});

      const spyCleanUploadingFiles = jest.spyOn(
        postService,
        '_cleanUploadingFiles',
      );
      spyCleanUploadingFiles.mockImplementation(() => {});

      await postService.reSendPost(info.id);
      setTimeout(() => {
        expect(itemService.resendFailedItems).toBeCalledWith([-1]);
        expect(spyHandlePreInsertProcess).toBeCalled();
        expect(spySendPostWithPreInsertItems).toBeCalledWith(info);
        expect(spyCleanUploadingFiles).not.toBeCalled();
        done();
      });
    });

    it('should send post after all file items has been send', async (done: jest.DoneCallback) => {
      const info = _.cloneDeep(postMockInfo);
      info.item_ids = [-1, 3];
      PostServiceHandler.buildPostInfo.mockResolvedValueOnce(info);

      const spyResendFailedItems = jest.spyOn(
        postService,
        '_resendFailedItems',
      );
      spyResendFailedItems.mockImplementation(() => {});

      const spyHandlePreInsertProcess = jest.spyOn(
        postService,
        '_handlePreInsertProcess',
      );
      spyHandlePreInsertProcess.mockImplementation(() => {});

      const spySendPost = jest.spyOn(postService, '_sendPost');
      spySendPost.mockImplementation(() => {});
      itemService.sendItemData.mockImplementationOnce(() => {});
      notificationCenter.on.mockImplementationOnce(
        (event: string | string[], listener: Listener) => {
          listener({
            status: SENDING_STATUS.SUCCESS,
            preInsertId: -1,
            updatedId: 1,
          });
        },
      );

      itemService.getItemsSendingStatus.mockReturnValue([
        SENDING_STATUS.INPROGRESS,
      ]);

      await postService.sendPost(info);

      setTimeout(() => {
        expect(spySendPost).toBeCalledTimes(1);
        expect(spyHandlePreInsertProcess).toBeCalledWith(info);
        expect(notificationCenter.removeListener).toBeCalled();
        expect(notificationCenter.on).toBeCalledWith(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          expect.anything(),
        );
        expect(spyResendFailedItems).not.toBeCalled();
        expect(itemService.cleanUploadingFiles).toBeCalledWith(info.group_id);
        expect(itemService.sendItemData).toBeCalled();
        done();
      });
    });

    it('should let post failed if send post with pseudo items and all items are failed', async () => {
      const info = _.cloneDeep(postMockInfo);
      info.item_ids = [-1, 3];
      PostServiceHandler.buildPostInfo.mockResolvedValueOnce(info);

      const spyResendFailedItems = jest.spyOn(
        postService,
        '_resendFailedItems',
      );
      spyResendFailedItems.mockImplementation(() => {});

      const spyHandlePreInsertProcess = jest.spyOn(
        postService,
        '_handlePreInsertProcess',
      );
      spyHandlePreInsertProcess.mockImplementation(() => {});

      const spyHandleSendPostFail = jest.spyOn(
        postService,
        'handleSendPostFail',
      );
      spyHandleSendPostFail.mockImplementation(() => {});

      const spySendPost = jest.spyOn(postService, '_sendPost');
      spySendPost.mockImplementation(() => {});

      itemService.getItemsSendingStatus.mockReturnValue([SENDING_STATUS.FAIL]);

      await postService.sendPost(info);

      setTimeout(() => {
        expect(spyHandleSendPostFail).toBeCalled();
        expect(spySendPost).not.toBeCalled();
        expect(spyHandlePreInsertProcess).toBeCalledWith(info);
        expect(notificationCenter.removeListener).not.toBeCalled();
        expect(notificationCenter.on).not.toBeCalled();
        expect(spyResendFailedItems).toBeCalled(info.id);
        expect(itemService.cleanUploadingFiles).toBeCalledWith(info.group_id);
        done();
      });
    });
  });

  describe('deletePostsByGroupIds', async () => {
    it('should delete posts from group', async () => {
      postDao.queryPostsByGroupId.mockResolvedValue([
        { id: 1, group_id: 3 },
        { id: 2, group_id: 3 },
      ]);
      await postService.deletePostsByGroupIds([3], false);
      expect(postDao.bulkDelete).toHaveBeenCalledWith([1, 2]);
      expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(0);
    });
    it('should do notify', async () => {
      postDao.queryPostsByGroupId.mockResolvedValue([{ id: 1, group_id: 3 }]);
      await postService.deletePostsByGroupIds([3], true);
      expect(postDao.bulkDelete).toHaveBeenCalledWith([1]);
      expect(notificationCenter.emitEntityDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLastPostOfGroup()', () => {
    it('should proxy call GroupDao right', () => {
      // should we test method inner implement?
      const groupId = 11;
      daoManager.getDao.mockReturnValueOnce(postDao);
      postService.getLastPostOfGroup(groupId);
      expect(postDao.queryLastPostByGroupId).toHaveBeenCalledTimes(1);
      expect(postDao.queryLastPostByGroupId).toHaveBeenCalledWith(groupId);
    });
  });

  describe('handleSendPostSuccess()', () => {
    it('should update group send failure post ids', async () => {
      const postId = 100;
      const preInsertId = -1;
      groupService.getGroupSendFailurePostIds.mockReturnValueOnce([
        preInsertId,
      ]);
      await postService.handleSendPostSuccess(
        {
          _id: postId,
          id: postId,
          error: { code: '400', message: '', validation: false },
          ...postFactory.build({}),
        },
        preInsertId,
      );
      expect(groupService.getGroupSendFailurePostIds).toBeCalled();
      expect(groupService.updateGroupSendFailurePostIds).toBeCalled();
    });
  });
});
