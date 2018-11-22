/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-05 15:31:40
 */
import PostDao from '..';
import { setup } from '../../__tests__/utils';
import _ from 'lodash';
import { Post } from '../../../models';
import { postFactory } from '../../../__tests__/factories';

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

describe('Post Dao', () => {
  let postDao: PostDao;

  beforeAll(() => {
    const { database } = setup();
    postDao = new PostDao(database);
  });

  it('Save posts', async () => {
    await postDao.bulkPut(posts);
    const result: Post = await postDao.get(3752569593860);
    expect(result.text).toBe('2');
  });

  describe('Queries', () => {
    beforeAll(async () => {
      await postDao.clear();
      await postDao.bulkPut(posts);
    });

    it('Query posts by group Id', async () => {
      const result = await postDao.queryPostsByGroupId(9163628546, 0, null, 3);
      expect(result).toHaveLength(3);
      expect(result[0].created_at).toBe(4);
    });

    it('Query last post by group ID', async () => {
      const result = await postDao.queryLastPostByGroupId(9163628546);
      expect(result.group_id).toBe(9163628546);
      expect(result.created_at).toBe(4);
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

  describe('purge posts', () => {
    beforeEach(async () => {
      await postDao.clear();
      await postDao.bulkPut(posts);
    });

    it('purge all posts by group id', async () => {
      await expect(
        postDao.queryPostsByGroupId(9163628546),
      ).resolves.toHaveLength(4);
      await postDao.purgePostsByGroupId(9163628546);
      await expect(
        postDao.queryPostsByGroupId(9163628546),
      ).resolves.toHaveLength(0);
    });

    it('purge all posts by group id', async () => {
      await expect(
        postDao.queryPostsByGroupId(9163628546),
      ).resolves.toHaveLength(4);
      await postDao.purgePostsByGroupId(9163628546, 1);
      const result = await postDao.queryPostsByGroupId(9163628546);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1151236399108,
        created_at: 4,
      });
    });
  });
  describe('local pre-inserted posts', () => {
    beforeEach(async () => {
      await postDao.clear();
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
});
