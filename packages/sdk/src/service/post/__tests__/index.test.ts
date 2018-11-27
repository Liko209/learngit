/// <reference path="../../../__tests__/types.d.ts" />
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
import _ from 'lodash';
import { postFactory, itemFactory } from '../../../__tests__/factories';

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
// PostAPI.getDataById = jest.fn();
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
      const mockNormal = {
        data: {
          posts: [{ _id: 1 }, { _id: 2 }],
          items: [{ _id: 11 }, { _id: 22 }],
        },
      };
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
        posts: mockNormal.data.posts,
        items: mockNormal.data.items,
        hasMore: false,
      });
    });

    it('should handle limit', async () => {
      const mockHasMore = {
        data: {
          posts: [{ _id: 1 }, { _id: 2 }],
          items: [{ _id: 11 }, { _id: 22 }],
        },
      };
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
        posts: mockHasMore.data.posts,
        items: mockHasMore.data.items,
        hasMore: true,
      });
    });

    it('should return remote posts', async () => {
      // test not postId
      const mockNotPostId = {
        data: {
          posts: [{ _id: 1 }, { _id: 2 }],
          items: [{ _id: 11 }, { _id: 22 }],
        },
      };
      PostAPI.requestPosts.mockResolvedValue(mockNotPostId);
      groupService.getById.mockResolvedValue({
        most_recent_post_created_at: 2,
      });
      const resultNotPostId = await postService.getPostsFromRemote({
        groupId: 1,
        limit: 2,
      });
      expect(resultNotPostId).toEqual({
        posts: mockNotPostId.data.posts,
        items: mockNotPostId.data.items,
        hasMore: true,
      });
    });

    it('should return [] when no matched', async () => {
      PostAPI.requestPosts.mockResolvedValue(null);
      groupService.getById.mockResolvedValue({
        most_recent_post_created_at: 2,
      });
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
      jest.spyOn(postDao, 'queryManyPostsByIds');
      jest.spyOn(PostAPI, 'requestByIds');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return local posts if exists', async () => {
      const localPosts = [{ id: 3 }, { id: 4 }, { id: 5 }];
      postDao.queryManyPostsByIds.mockReturnValue(localPosts);
      const result = await postService.getPostsByIds([3, 4, 5]);
      expect(result.posts).toEqual(localPosts);
    });

    it('should return local posts + remote posts if partly exists', async () => {
      const localPosts = [{ id: 3 }, { id: 4 }, { id: 5 }];
      const remotePosts = [{ id: 1 }, { id: 2 }];
      postDao.queryManyPostsByIds.mockResolvedValue([...localPosts]);
      PostAPI.requestByIds.mockResolvedValue({
        data: { posts: [...remotePosts], items: [] },
      });
      baseHandleData.mockImplementationOnce((data: any) => data);
      itemService.getByPosts.mockResolvedValue([]);
      const result = await postService.getPostsByIds([1, 2, 3, 4, 5]);
      expect(result.posts.map(({ id }) => id).sort()).toEqual(
        [...remotePosts, ...localPosts].map(({ id }) => id).sort(),
      );
    });

    it('should return remote posts if none in local', async () => {
      const localPosts = [];
      const remotePosts = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
      ];
      postDao.queryManyPostsByIds.mockResolvedValue([...localPosts]);
      PostAPI.requestByIds.mockResolvedValue({
        data: { posts: [...remotePosts], items: [] },
      });
      baseHandleData.mockImplementationOnce((data: any) => data);
      itemService.getByPosts.mockResolvedValue([]);
      const result = await postService.getPostsByIds([1, 2, 3, 4, 5]);
      expect(result.posts.map(({ id }) => id).sort()).toEqual(
        [...remotePosts].map(({ id }) => id).sort(),
      );
    });

    it('should return items get with itemService for local posts', async () => {
      const localPosts = [{ id: 3 }, { id: 4 }, { id: 5 }];
      itemService.getByPosts.mockResolvedValue([
        { id: 100 },
        { id: 101 },
        { id: 102 },
      ]);
      postDao.queryManyPostsByIds.mockReturnValue(localPosts);
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
      postDao.queryManyPostsByIds.mockResolvedValue([...localPosts]);
      PostAPI.requestByIds.mockResolvedValue({
        data: { posts: [...remotePosts], items: [{ id: 103 }, { id: 104 }] },
      });
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
      PostServiceHandler.buildPostInfo.mockReturnValueOnce({
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
      const info = _.cloneDeep(postMockInfo);
      const responseData = _.cloneDeep(postMockInfo);
      responseData.id = 99999;
      const response = {
        data: responseData,
      };
      PostServiceHandler.buildPostInfo.mockReturnValueOnce(info);
      PostAPI.sendPost.mockResolvedValueOnce(response);
      groupService.getGroupSendFailurePostIds.mockResolvedValue([]);

      const results = await postService.sendPost({ text: 'abc' });
      console.log(response, info, results);
      expect(results[0].id).toEqual(-1);
      expect(results[0].data.id).toEqual(99999);
      expect(results[0].data.text).toEqual('abc');
    });

    it('should send post fail', async () => {
      const info = _.cloneDeep(postMockInfo);
      PostServiceHandler.buildPostInfo.mockReturnValueOnce(info);
      PostAPI.sendPost.mockResolvedValueOnce({ data: { error: {} } });
      await expect(postService.sendPost({ text: 'abc' })).rejects.toThrow();
    });
  });
  describe('sendItemFile()', () => {
    it('should send file', async () => {
      itemService.sendFile.mockResolvedValueOnce({ id: 1 });
      PostAPI.sendPost.mockResolvedValueOnce({ data: { _id: 1 } });
      baseHandleData.mockResolvedValueOnce([{ id: 1 }]);
      PostServiceHandler.buildPostInfo.mockResolvedValue({ id: -123 });

      const result = await postService.sendItemFile({
        groupId: 1,
        file: new FormData(),
        text: '',
      });

      expect(PostServiceHandler.buildPostInfo).toHaveBeenCalledWith({
        groupId: 1,
        itemIds: [1],
        text: '',
      });

      expect(result).toEqual({ id: 1 });
    });

    it('should return null when no groupId', async () => {
      const result = await postService.sendItemFile({
        file: new FormData(),
        text: 'abc',
      });
      expect(result).toBeNull();
    });

    it('should return null when itemService.sendFile() return nothing', async () => {
      const params = { groupId: 1, text: 'abc', file: new FormData() };
      const result = await postService.sendItemFile(params);
      expect(itemService.sendFile).toHaveBeenCalledWith(params);
      expect(result).toBeNull();
    });
  });

  describe('modifyPost()', () => {
    it('should return null when postId no given', async () => {
      const result = await postService.modifyPost({ text: 'abc' });
      expect(result).toBeNull();
    });

    it('should call PostAPI.editPost()', async () => {
      PostServiceHandler.buildModifiedPostInfo.mockResolvedValue({});
      PostAPI.editPost.mockResolvedValueOnce({ data: {} });
      baseHandleData.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);

      const result = await postService.modifyPost({ postId: 1, text: 'abc' });

      expect(PostAPI.editPost).toHaveBeenCalledWith(1, {});
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('like post', () => {
    it('should return null when post id is negative', async () => {
      const result = await postService.likePost(-1, 101, true);
      expect(result).toBe(undefined);
    });
    it('should return null when post is not exist in local', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce(null);
      const result = await postService.likePost(100, 101, true);
      expect(result).toBe(undefined);
    });
    it('should return post with likes', async () => {
      const post = { id: 100, likes: [] };
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce(post);
      PostAPI.putDataById.mockResolvedValueOnce({
        data: { _id: 100, likes: [101] },
      });
      baseHandleData.mockResolvedValueOnce([{ id: 100, likes: [101] }]);
      const result = await postService.likePost(100, 101, true);
      expect(post.likes).toEqual([101]);
    });
    it('should return old post if person id is not in post likes when to unlike', async () => {
      const post = { id: 100, likes: [] };
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce(post);
      await postService.likePost(100, 102, false);
      expect(post.likes).toEqual([]);
    });
    it('should return old post if person id is in post likes when to like', async () => {
      const post = { id: 100, likes: [] };
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce(post);
      const result = await postService.likePost(100, 101, true);
      expect(post.likes).toEqual([101]);
    });

    it('should return new post if person id is in post likes when to unlike', async () => {
      const postInDao = { id: 100, likes: [101, 102] };
      const postInApi = { _id: 100, likes: [102] };
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce(postInDao);
      PostAPI.putDataById.mockResolvedValueOnce({
        data: postInApi,
      });

      baseHandleData.mockResolvedValueOnce([{ id: 100, likes: [102] }]);
      const result = await postService.likePost(100, 101, false);
      expect(postInDao.likes).toEqual([102]);
    });

    it('should return new post if person id is in post likes when to unlike', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({ id: 100, likes: [101, 102] });
      PostAPI.putDataById.mockResolvedValueOnce({
        error: { _id: 100, likes: [102] },
      });
      const result = await postService.likePost(100, 101, false);
      expect(result).toBeUndefined();
    });
  });

  describe('delete post', () => {
    it('should return null when post id is negative', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      const result = await postService.deletePost(-1);
      expect(result).toBe(false);
    });
    it('should return post', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({
        id: 100,
      });
      PostAPI.putDataById.mockResolvedValueOnce({
        data: { id: 100, deactivated: true },
      });
      baseHandleData.mockResolvedValueOnce([{ id: 100, deactivated: true }]);
      const result = await postService.deletePost(100);
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
  });

  describe('bookMark Post', () => {
    it('book post should return null', async () => {
      profileService.putFavoritePost.mockResolvedValueOnce(null);
      const result = await postService.bookmarkPost(1, true);
      expect(result).toBeUndefined();
    });
  });

  describe('reSendPost', async () => {
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
      PostAPI.requestPosts.mockResolvedValue({
        data: {
          posts: [{ _id: 123 }],
        },
      });

      await expect(postService.getNewestPostIdOfGroup(1)).resolves.toBe(123);
    });

    it('should return null if api result is empty', async () => {
      PostAPI.requestPosts.mockResolvedValue({
        data: {
          posts: [],
        },
      });

      await expect(postService.getNewestPostIdOfGroup(1)).resolves.toBe(null);
    });

    it('should return null if error', async () => {
      PostAPI.requestPosts.mockRejectedValue(new Error());

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
    it('should get group success then send post', async () => {
      const g = { id: 44 };
      groupService.getGroupByMemberList.mockResolvedValue(g);

      const msg = '  text message  ';
      const spy = jest.spyOn(postService, 'sendPost');
      spy.mockResolvedValue([{ id: 10, data: 'good' }]);
      const result = await postService.newMessageWithPeopleIds([1, 2, 3], msg);

      expect(spy).toBeCalledWith({ groupId: g.id, text: msg });
      expect(result).toEqual({ id: 44 });
    });

    it('should not call send post when get group failed', async () => {
      const spy = jest.spyOn(postService, 'sendPost');
      groupService.getGroupByMemberList.mockResolvedValue(null);
      const result = await postService.newMessageWithPeopleIds(
        [1, 2, 3],
        'text message',
      );
      expect(spy).not.toBeCalled();
      expect(result).toBeUndefined;
    });

    it('should not call send post when send empty message ', async () => {
      const g = { id: 44 };
      groupService.getGroupByMemberList.mockResolvedValue(g);
      jest.spyOn(postService, 'sendPost');

      let result = await postService.newMessageWithPeopleIds([1, 2, 3], '   ');
      expect(result).toEqual({ id: 44 });
      result = await postService.newMessageWithPeopleIds([1, 2, 3], '');
      expect(result).toEqual({ id: 44 });

      expect(postService.sendPost).not.toBeCalled();
    });
  });
});
