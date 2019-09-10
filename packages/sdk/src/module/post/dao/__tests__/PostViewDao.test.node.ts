/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-10 20:55:43
 * Copyright © RingCentral. All rights reserved.
 */
import { PostViewDao } from '../PostViewDao';
import { PostDao } from '../PostDao';
import { setup } from '../../../../dao/__tests__/utils';
import _ from 'lodash';
import { Post, PostView } from '../../entity';
import { QUERY_DIRECTION } from '../../../../dao/constants';
import { postFactory } from '../../../../__tests__/factories';
import { daoManager } from '../../../../dao';
import { ArrayUtils } from 'sdk/utils/ArrayUtils';

const postViews: PostView[] = [
  {
    id: 3752569593860,
    group_id: 9163628546,
    created_at: 1,
  },
  {
    id: 3752569536516,
    group_id: 9163628546,
    created_at: 3,
  },
  {
    id: 1151236399108,
    group_id: 9163628546,
    created_at: 4,
  },
  {
    id: 1151236554756,
    group_id: 9163628546,
    created_at: 2,
  },
  {
    id: 1151236554700,
    group_id: 9163628546,
    created_at: 5,
  },
  {
    id: 1151236554701,
    group_id: 9163628546,
    created_at: 6,
  },
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
  postFactory.build({
    id: 1151236554700,
    group_id: 9163628546,
    created_at: 5,
  }),
  postFactory.build({
    id: 1151236554701,
    group_id: 9163628546,
    created_at: 6,
  }),
];

describe('PostViewDao', () => {
  let postViewDao: PostViewDao;
  let postDao: PostDao;
  let fetchPostsFunc: (ids: number[]) => Promise<Post[]>;

  beforeAll(() => {
    const { database } = setup();
    postViewDao = new PostViewDao(database);
    jest.spyOn(daoManager, 'getDao').mockReturnValue(postViewDao);
    postDao = new PostDao(database);
  });

  describe('queryPostsByGroupId()', () => {
    beforeEach(async () => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
      await postDao.clear();
      await postDao.bulkPut(posts);
      jest.spyOn(daoManager, 'getDao').mockReturnValue(postDao);
      fetchPostsFunc = async (ids: number[]) => {
        const posts = await postDao.batchGet(ids);
        return _.orderBy(posts, 'created_at', 'asc');
      };
    });

    it('should return directly when db has not posts', async () => {
      await postDao.clear();
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[2]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        1151236399108,
        QUERY_DIRECTION.OLDER,
        3,
      );
      const spy = jest.spyOn(ArrayUtils, 'sliceIdArray');
      expect(result).toHaveLength(0);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should return older posts when direction is older and post id > 0', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[2]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        1151236399108,
        QUERY_DIRECTION.OLDER,
        3,
      );
      expect(result).toHaveLength(3);
      expect(_.first(result).created_at).toBe(1);
    });

    it('should return newer posts when direction is newer and post id > 0', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[5]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        3752569593860,
        QUERY_DIRECTION.NEWER,
        3,
      );
      expect(result).toHaveLength(3);
      expect(_.first(result).created_at).toBe(2);
    });

    it('should return both posts when direction is both | post id > 0 | postIdIndex - halfLimit === 0', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[2]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        1151236399108,
        QUERY_DIRECTION.BOTH,
        4,
      );
      expect(result).toHaveLength(4);
      expect(_.first(result).created_at).toBe(2);
      expect(_.last(result).created_at).toBe(5);
    });

    it('should return both posts when direction is both | post id > 0 | postIdIndex - halfLimit > 0', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[1]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        3752569536516,
        QUERY_DIRECTION.BOTH,
        4,
      );
      expect(result).toHaveLength(4);
      expect(_.last(result).created_at).toBe(4);
      expect(_.first(result).created_at).toBe(1);
    });

    it('should return both posts when direction is both | post id > 0 | postIdIndex - halfLimit < 0', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[2]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        1151236554700,
        QUERY_DIRECTION.BOTH,
        4,
      );
      expect(result).toHaveLength(4);
      expect(_.last(result).created_at).toBe(6);
      expect(_.first(result).created_at).toBe(3);
    });

    it('should return both posts when direction is both | post id > 0 | endIndex < posts.length', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[1]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        3752569536516,
        QUERY_DIRECTION.BOTH,
        4,
      );
      expect(result).toHaveLength(4);
      expect(_.first(result).created_at).toBe(1);
      expect(_.last(result).created_at).toBe(4);
    });

    it('should return both posts when direction is both | post id > 0 | endIndex === posts.length', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[3]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        1151236554756,
        QUERY_DIRECTION.BOTH,
        4,
      );
      expect(result).toHaveLength(4);
      expect(_.last(result).created_at).toBe(4);
      expect(_.first(result).created_at).toBe(1);
    });

    it('should return both posts when direction is both | post id > 0 | entIndex > posts.length', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[0]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        3752569593860,
        QUERY_DIRECTION.BOTH,
        4,
      );
      expect(result).toHaveLength(4);
      expect(_.last(result).created_at).toBe(4);
      expect(_.first(result).created_at).toBe(1);
    });

    it('should return both posts when direction is both | post id > 0 | postIdIndex - halfLimit < 0 | entIndex > posts.length', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[0]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        3752569536516,
        QUERY_DIRECTION.BOTH,
        8,
      );
      expect(result).toHaveLength(6);
      expect(_.last(result).created_at).toBe(6);
      expect(_.first(result).created_at).toBe(1);
    });

    it('should return older posts when direction is older and post id === 0', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[2]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        0,
        QUERY_DIRECTION.OLDER,
        3,
      );
      expect(result).toHaveLength(3);
    });

    it('should return empty when direction is newer and post id === 0', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[0]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        0,
        QUERY_DIRECTION.NEWER,
        3,
      );
      expect(result).toHaveLength(3);
      expect(_.last(result).created_at).toBe(3);
    });
  });

  describe('queryUnreadPostsByGroupId()', () => {
    beforeAll(async () => {
      await postDao.clear();
      await postDao.bulkPut(unreadPosts);
    });

    beforeEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
      jest.spyOn(daoManager, 'getDao').mockReturnValue(postDao);
      fetchPostsFunc = async (ids: number[]) => {
        const posts = await postDao.batchGet(ids);
        return _.orderBy(posts, 'created_at', 'asc');
      };
    });

    it('should return posts which < endPostId if start post id is 0', async () => {
      const result = await postViewDao.queryUnreadPostsByGroupId(
        fetchPostsFunc,
        {
          groupId: 9163628546,
          startPostId: 0,
          endPostId: 3752569594960,
          limit: 500,
        },
      );
      expect(result).toHaveLength(5);
      expect(_.first(result).created_at).toBe(1);
      expect(_.last(result).created_at).toBe(5);
    });

    it('should return interval post if start post in range', async () => {
      const result = await postViewDao.queryUnreadPostsByGroupId(
        fetchPostsFunc,
        {
          groupId: 9163628546,
          startPostId: 3752569593870,
          endPostId: 3752569693960,
          limit: 500,
        },
      );
      expect(result).toHaveLength(5);
      expect(_.first(result).created_at).toBe(2);
      expect(_.last(result).created_at).toBe(6);
    });

    it('should return interval post if start post is deactivated', async () => {
      const result = await postViewDao.queryUnreadPostsByGroupId(
        fetchPostsFunc,
        {
          groupId: 9163628546,
          startPostId: 3752569593962,
          endPostId: 3752569594960,
          limit: 500,
        },
      );
      expect(result).toHaveLength(2);
      expect(_.first(result).created_at).toBe(4);
      expect(_.last(result).created_at).toBe(5);
    });

    it('should return all older than posts if start post is the first post in db', async () => {
      const result = await postViewDao.queryUnreadPostsByGroupId(
        fetchPostsFunc,
        {
          groupId: 9163628546,
          startPostId: 3752569593860,
          endPostId: 3752569594960,
          limit: 500,
        },
      );
      expect(result).toHaveLength(5);
      expect(_.first(result).created_at).toBe(1);
      expect(_.last(result).created_at).toBe(5);
    });
  });

  describe('toViewItem', () => {
    it('should return view post', () => {
      const post = unreadPosts[0];
      expect(postViewDao.toViewItem(post)).toEqual({
        created_at: 1,
        group_id: 9163628546,
        id: 3752569593860,
      });
    });
  });

  describe('toPartialViewItem', () => {
    it('should return partial view post', () => {
      const post = unreadPosts[0];
      expect(postViewDao.toViewItem(post)).toEqual({
        created_at: 1,
        group_id: 9163628546,
        id: 3752569593860,
      });
    });
  });

  describe('getCollection', () => {
    it('should return collection of db', () => {
      expect(postViewDao.getCollection()).toEqual(expect.anything());
    });
  });
});
