/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-05 15:31:40
 */
import { PostDao } from '../index';
import { setup } from '../../../../dao/__tests__/utils';
import _ from 'lodash';
import { postFactory } from '../../../../__tests__/factories';
import { QUERY_DIRECTION } from '../../../../dao/constants';
import { daoManager } from '../../../../dao';
import { PostViewDao } from '../PostViewDao';
import { Post } from '../../entity';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

const posts: Post[] = [
  postFactory.build({
    id: 3752569593860,
    text: '2',
    group_id: 9163628546,
    created_at: 1,
  }),
  postFactory.build({
    id: 3752569536516,
    group_id: 9163628546,
    created_at: 3,
  }),
  postFactory.build({
    id: 1151236399108,
    group_id: 9163628546,
    created_at: 4,
  }),
  postFactory.build({
    id: 1151236554756,
    group_id: 9163628546,
    created_at: 2,
  }),
];

const unreadPosts: Post[] = [
  postFactory.build({
    id: 3752569593860,
    text: '2',
    group_id: 9163628546,
    created_at: 1,
  }),
  postFactory.build({
    id: 3752569593870,
    group_id: 9163628546,
    created_at: 3,
  }),
  postFactory.build({
    id: 3752569593960,
    group_id: 9163628546,
    created_at: 4,
  }),
  postFactory.build({
    id: 3752569593866,
    group_id: 9163628546,
    created_at: 2,
  }),
  postFactory.build({
    id: 3752569594960,
    group_id: 9163628546,
    created_at: 5,
  }),
  postFactory.build({
    id: 3752569693960,
    group_id: 9163628546,
    created_at: 6,
  }),
];

describe('Post Dao', () => {
  let postViewDao: PostViewDao;
  let postDao: PostDao;

  beforeEach(() => {
    clearMocks();
    const { database } = setup();
    postViewDao = new PostViewDao(database);
    daoManager.getDao = jest.fn().mockImplementation(x => {
      switch (x) {
        case PostViewDao:
          return postViewDao;
        default:
          return PostDao;
      }
    });
    postDao = new PostDao(database);
  });

  describe('Save', () => {
    it('Save posts', async () => {
      await postDao.bulkPut(posts);
      const results = await postDao.get(3752569593860);
      expect(results!.text).toBe('2');
    });
  });

  describe('Queries', () => {
    beforeEach(async () => {
      await postDao.bulkPut(posts);
    });

    it('Query older posts by group Id and post id', async () => {
      const result = await postDao.queryPostsByGroupId(
        9163628546,
        1151236399108,
        QUERY_DIRECTION.OLDER,
        3,
      );
      expect(result).toHaveLength(3);
      expect(result[0].created_at).toBe(1);
    });

    it('Query newer posts by group Id and post id', async () => {
      jest.spyOn(postDao, 'get').mockResolvedValue(posts[0]);
      const result = await postDao.queryPostsByGroupId(
        9163628546,
        3752569593860,
        QUERY_DIRECTION.NEWER,
        3,
      );
      expect(result).toHaveLength(3);
      expect(result[0].created_at).toBe(2);
    });

    it('Query Oldest Post By Group Id', async () => {
      let result = await postDao.queryOldestPostByGroupId(123);
      expect(result).toBeFalsy();
      result = await postDao.queryOldestPostByGroupId(9163628546);
      expect(result).not.toBeFalsy();
      expect(result.created_at).toBe(1);
    });

    it('Delete posts by keys', async () => {
      await postDao.bulkDelete([posts[0].id, posts[1].id]);
      const result1 = await postDao.get(posts[0].id);
      const result2 = await postDao.get(posts[1].id);
      expect(result1).toBeFalsy();
      expect(result2).toBeFalsy();
    });
  });

  describe('queryUnreadPostsByGroupId()', () => {
    beforeEach(async () => {
      await postDao.bulkPut(unreadPosts);
    });

    it('should call postViewDao queryIntervalPostsByGroupId', async () => {
      const spy = jest.spyOn(postViewDao, 'queryUnreadPostsByGroupId');
      const result = await postDao.queryUnreadPostsByGroupId({
        groupId: 9163628546,
        startPostId: 1151236554756,
        endPostId: 1151236399108,
        unreadCount: 500,
      });
      expect(result.length).toEqual(0);
      expect(spy).toHaveBeenCalled();
    });

    it('should return interval posts if start post is in db and end post is in db', async () => {
      const result = await postDao.queryUnreadPostsByGroupId({
        groupId: 9163628546,
        startPostId: 3752569593866,
        endPostId: 3752569594960,
        unreadCount: 500,
      });
      expect(result).toHaveLength(5);
      expect(_.first(result).created_at).toBe(1);
      expect(_.last(result).created_at).toBe(5);
    });
  });

  describe('local pre-inserted posts', () => {
    beforeEach(async () => {
      const processedPosts: Post[] = [];

      posts.forEach((element: Post) => {
        const post = _.cloneDeep(element);
        post.id = -post.id;
        processedPosts.push(post);
      });

      await postDao.bulkPut(processedPosts);
    });

    it('local pre-inserted posts', async () => {
      const result = await postDao.queryPreInsertPost();
      expect(result.length).toBeGreaterThan(1);
      expect(result[0].id).toBeLessThan(0);
    });
  });

  describe('groupPostCount', () => {
    beforeEach(async () => {
      await postDao.bulkPut(posts);
    });
    it('should return 4 when there has 4 posts group_id 9163628546', async () => {
      const result = await postDao.groupPostCount(9163628546);
      expect(result).toEqual(4);
    });

    it('should return 0 when there has not post group_id 99999', async () => {
      const result = await postDao.groupPostCount(99999);
      expect(result).toEqual(0);
    });
  });

  describe('queryPostIdsByGroupId', () => {
    it('should call post view batchGet', async () => {
      postViewDao.batchGet = jest.fn().mockReturnValue([]);
      await postDao.queryPostViewByIds([1]);
      expect(postViewDao.batchGet).toHaveBeenCalledWith([1]);
    });
  });

  describe('initPosts', () => {
    it('should call post view batchGet', async () => {
      await postDao.bulkPut(posts);
      postViewDao.batchGet = jest.fn().mockReturnValue([]);
      const result = await postDao.initPosts(9163628546);
      expect(result.length).toEqual(4);
    });
  });
});
