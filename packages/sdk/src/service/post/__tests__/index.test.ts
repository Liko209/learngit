/// <reference path="../../../__tests__/types.d.ts" />
import { daoManager, PostDao, ItemDao } from '../../../dao';
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
// PostAPI.getDataById = jest.fn();
PostAPI.putDataById = jest.fn();

describe('PostService', () => {
  const postService = new PostService();
  const itemService = new ItemService();
  const profileService = new ProfileService();
  const postDao = new PostDao(null);
  const itemDao = new ItemDao(null);
  const postMockInfo = postFactory.build({
    id: -1,
    created_at: 11111,
    modified_at: 11111,
    creator_id: 1,
    version: 2222,
    new_version: 2222,
    is_new: true,
    model_size: 0,
    text: 'abc',
    group_id: 4,
    from_group_id: 4,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    ItemService.getInstance = jest.fn().mockReturnValue(itemService);
    ProfileService.getInstance = jest.fn().mockReturnValue(profileService);
    GroupService.getInstance = jest.fn().mockReturnValue({
      getGroupSendFailurePostIds: jest.fn().mockReturnValue([]),
      updateGroupSendFailurePostIds: jest.fn(),
    });
    daoManager.getDao.mockReturnValueOnce(postDao);
    daoManager.getDao.mockReturnValueOnce(itemDao);
  });

  describe('getPostsFromLocal()', () => {
    it('should return posts', async () => {
      const mockPosts = postFactory.buildList(2);
      const mockItems = itemFactory.buildList(3);
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemDao.getItemsByIds.mockResolvedValue(mockItems);

      const result = await postService.getPostsFromLocal({
        groupId: 1,
        offset: 0,
        limit: 20,
      });

      expect(result).toEqual({
        hasMore: true,
        items: mockItems,
        posts: mockPosts,
      });
    });

    it('should return empty result', async () => {
      const mockPosts = [];
      const mockItems = [];
      postDao.queryPostsByGroupId.mockResolvedValue(mockPosts);
      itemDao.getItemsByIds.mockResolvedValue(mockItems);

      const result = await postService.getPostsFromLocal({
        groupId: 1,
        offset: 0,
        limit: 20,
      });

      expect(result).toEqual({ hasMore: true, items: [], posts: [] });
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
      const result = await postService.getPostsFromRemote({
        groupId: 1,
        postId: 11,
        offset: 0,
        limit: 20,
      });
      expect(result).toEqual({
        posts: mockNormal.data.posts,
        items: mockNormal.data.items,
        hasMore: false,
      });
    });

    it('should handle offset/limit', async () => {
      const mockHasMore = {
        data: {
          posts: [{ _id: 1 }, { _id: 2 }],
          items: [{ _id: 11 }, { _id: 22 }],
        },
      };
      PostAPI.requestPosts.mockResolvedValue(mockHasMore);
      const resultHasMore = await postService.getPostsFromRemote({
        groupId: 1,
        postId: 11,
        offset: 0,
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
      const resultNotPostId = await postService.getPostsFromRemote({
        groupId: 1,
        offset: 0,
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
      const resultNull = await postService.getPostsFromRemote({
        groupId: 1,
        offset: 0,
        limit: 2,
      });
      expect(resultNull).toEqual({
        posts: [],
        items: [],
        hasMore: false,
      });
    });
  });

  describe('getPostsByGroupId()', () => {
    beforeAll(() => {
      jest.spyOn(postService, 'getPostsFromLocal');
      jest.spyOn(postService, 'getPostsFromRemote');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return local data', async () => {
      postService.getPostsFromLocal.mockResolvedValueOnce({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: true,
      });
      const resultEmpty = await postService.getPostsByGroupId({
        groupId: 1,
        offset: 0,
      });

      expect(postService.getPostsFromLocal).toHaveBeenCalledWith({
        groupId: 1,
        limit: 20,
        offset: 0,
      });
      expect(resultEmpty).toEqual({
        hasMore: true,
        items: [],
        posts: [{ id: 1 }, { id: 2 }],
      });
    });

    it('should return remote data', async () => {
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
        offset: 0,
        limit: 20,
      });
      expect(result).toEqual({
        posts: [{ id: 1 }, { id: 2 }],
        items: [],
        hasMore: false,
      });
    });

    it('should error case', async () => {
      postDao.queryPostsByGroupId.mockResolvedValue(null);
      const result = await postService.getPostsByGroupId({
        groupId: 1,
        offset: 0,
        limit: 20,
      });
      expect(result).toEqual({
        posts: [],
        items: [],
        hasMore: true,
      });
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
      expect(result).toBe(null);
    });
    it('should return null when post is not eixt in local', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce(null);
      const result = await postService.likePost(100, 101, true);
      expect(result).toBe(null);
    });
    it('should return post with likes', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({ id: 100, likes: [] });
      PostAPI.putDataById.mockResolvedValueOnce({
        data: { _id: 100, likes: [101] },
      });
      baseHandleData.mockResolvedValueOnce([{ id: 100, likes: [101] }]);
      const result = await postService.likePost(100, 101, true);
      expect(result.likes).toEqual([101]);
    });
    it('should return old post if person id is not in post likes when to unlike', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({ id: 100, likes: [101] });
      const result = await postService.likePost(100, 102, false);
      expect(result.likes).toEqual([101]);
    });
    it('should return old post if person id is in post likes when to like', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({ id: 100, likes: [101] });
      const result = await postService.likePost(100, 101, true);
      expect(result.likes).toEqual([101]);
    });

    it('should return new post if person id is in post likes when to unlike', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({ id: 100, likes: [101, 102] });
      PostAPI.putDataById.mockResolvedValueOnce({
        data: { _id: 100, likes: [102] },
      });

      baseHandleData.mockResolvedValueOnce([{ id: 100, likes: [102] }]);
      const result = await postService.likePost(100, 101, false);
      expect(result.likes).toEqual([102]);
    });

    it('should return new post if person id is in post likes when to unlike', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({ id: 100, likes: [101, 102] });
      PostAPI.putDataById.mockResolvedValueOnce({
        error: { _id: 100, likes: [102] },
      });
      const result = await postService.likePost(100, 101, false);
      expect(result).toBeNull();
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
      expect(result).toBeNull();
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
});
