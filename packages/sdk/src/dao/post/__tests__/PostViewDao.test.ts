/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-10 20:55:43
 * Copyright © RingCentral. All rights reserved.
 */
import PostDao, { PostViewDao } from '..';
import { setup } from '../../__tests__/utils';
import _ from 'lodash';
import { Post, PostView } from '../../../module/post/entity';
import { QUERY_DIRECTION } from '../../constants';
import { postFactory } from '../../../__tests__/factories';
import { daoManager } from '../..';

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
    beforeAll(async () => {
      await postDao.clear();
      await postDao.bulkPut(posts);
    });

    beforeEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
      jest.spyOn(daoManager, 'getDao').mockReturnValue(postDao);
      fetchPostsFunc = async (ids: number[]) => {
        const posts = await postDao.batchGet(ids);
        return _.orderBy(posts, 'created_at', 'desc');
      };
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
      expect(_.last(result).created_at).toBe(1);
    });

    it('should return newer posts when direction is newer and post id > 0', async () => {
      jest.spyOn(postViewDao, 'get').mockResolvedValue(postViews[0]);
      const result = await postViewDao.queryPostsByGroupId(
        fetchPostsFunc,
        9163628546,
        3752569593860,
        QUERY_DIRECTION.NEWER,
        3,
      );
      expect(result).toHaveLength(3);
      expect(_.last(result).created_at).toBe(2);
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
      expect(_.last(result).created_at).toBe(2);
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
      expect(result).toHaveLength(0);
    });
  });
});
