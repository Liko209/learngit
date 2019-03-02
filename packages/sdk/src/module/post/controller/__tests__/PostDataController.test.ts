/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-24 09:58:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemService } from '../../../item';
import { daoManager, DeactivatedDao } from '../../../../dao';
import { PostDao } from '../../dao';
import { ExtendedBaseModel } from '../../../models';
import { IPreInsertController } from '../../../common/controller/interface/IPreInsertController';
import { PROGRESS_STATUS } from '../../../progress';
import { PostDataController } from '../PostDataController';
import { Item } from '../../../item/entity';
import { Post } from '../../entity';
import { EntitySourceController } from '../../../../framework/controller/impl/EntitySourceController';
import { IEntityPersistentController } from '../../../../framework/controller/interface/IEntityPersistentController';
import _ from 'lodash';

jest.mock('../../../../framework/controller/impl/EntitySourceController');
jest.mock('../../../item');
jest.mock('../../../../dao');
jest.mock('../../dao');
jest.mock('../../../../framework/controller');

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

describe('PostDataController', () => {
  const itemService = new ItemService();
  const postDao = new PostDao(null);
  const deactivatedDao = new DeactivatedDao(null);
  const preInsertController = new MockPreInsertController();
  const mockEntitySourceController: EntitySourceController = new EntitySourceController(
    {} as IEntityPersistentController,
    {} as DeactivatedDao,
  );
  const postDataController = new PostDataController(
    preInsertController,
    mockEntitySourceController,
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
      if (arg === DeactivatedDao) {
        return deactivatedDao;
      }
    });
  }

  describe('handleFetchedPosts()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });
    it('should go through data handle process if data is not null', async () => {
      const data = {
        posts: [{ id: 3, group_id: 1 }, { id: 4, group_id: 2 }],
        items: [{ id: 12 }, { id: 23 }],
        hasMore: false,
      };
      const result = await postDataController.handleFetchedPosts(
        data,
        false,
        (posts: Post[], items: Item[]) => {},
      );
      expect(itemService.handleIncomingData).toBeCalled();
    });
  });

  describe('handleIndexPosts()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
      jest
        .spyOn(mockEntitySourceController, 'bulkDelete')
        .mockResolvedValueOnce({});
    });

    it('should return [] when [maxPostsExceed=true | posts.length=0]', async () => {
      const result = await postDataController.handleIndexPosts([], true);
      expect(result).toEqual([]);
    });

    it('should return all data if not modified and deactivated posts', async () => {
      const mock = [];
      for (let i = 1; i < 60; i += 1) {
        mock.push({ id: i, group_id: Math.random() > 0.5 ? 1 : 2 });
      }
      let result = await postDataController.handleIndexPosts(mock, true);
      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(mock);
    });

    it('should delete group which post length >= 50 posts when maxPostsExceed=true', async () => {
      const posts = [];
      const deleteIds = [];
      for (let i = 1; i < 60; i += 1) {
        posts.push({ id: i, group_id: 1 });
        if (i < 50) {
          deleteIds.push(i);
        }
      }
      for (let i = 61; i < 100; i += 1) {
        posts.push({ id: i, group_id: 2 });
      }
      postDao.queryPostIdsByGroupId.mockResolvedValue(deleteIds);
      let result = await postDataController.handleIndexPosts(posts, true);
      expect(mockEntitySourceController.bulkDelete).toBeCalledWith(deleteIds);
      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts);
    });

    it('should delete all group post length >= 50 posts when maxPostsExceed=true', async () => {
      const posts = [];
      const deleteGroupOneIds = [];
      const deleteGroupTwoIds = [];
      for (let i = 1; i < 60; i += 1) {
        posts.push({ id: i, group_id: 1 });
        if (i < 50) {
          deleteGroupOneIds.push(i);
        }
      }
      for (let i = 61; i < 130; i += 1) {
        posts.push({ id: i, group_id: 2 });
        deleteGroupTwoIds.push(i);
      }
      postDao.queryPostIdsByGroupId.mockImplementation(arg => {
        if (arg === 1) {
          return deleteGroupOneIds;
        }
        if (arg === 2) {
          return deleteGroupTwoIds;
        }
      });
      let result = await postDataController.handleIndexPosts(posts, true);
      expect(mockEntitySourceController.bulkDelete).toBeCalledWith(
        deleteGroupOneIds.concat(deleteGroupTwoIds),
      );
      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts);
    });

    it('should not call mockEntitySourceController.bulkDelete when maxPostsExceed=true but post length < 50', async () => {
      const posts = [];
      for (let i = 1; i < 30; i += 1) {
        posts.push({ id: i, group_id: 1 });
      }
      for (let i = 61; i < 30; i += 1) {
        posts.push({ id: i, group_id: 2 });
      }
      let result = await postDataController.handleIndexPosts(posts, true);
      expect(mockEntitySourceController.bulkDelete).not.toBeCalled();
      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts);
    });

    it('should delete older posts when maxPostsExceed=true but post length < 50', async () => {
      const posts = [];
      for (let i = 1; i < 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      postDao.queryOldestPostByGroupId.mockResolvedValue(posts[10]);
      let result = await postDataController.handleIndexPosts(posts, true);

      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts.slice(9, posts.length));
    });

    it('should not delete when [maxPostsExceed=true | posts.length < 50 | not any posts older than oldest post in db]', async () => {
      const posts = [];
      for (let i = 1; i < 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      postDao.queryOldestPostByGroupId.mockResolvedValue(posts[0]);
      let result = await postDataController.handleIndexPosts(posts, true);

      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts);
    });

    it('should delete when [maxPostsExceed=true | posts.length < 50 | group.length = 1 | not any posts older than oldest post in db]', async () => {
      const posts = [];
      for (let i = 1; i < 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      postDao.queryOldestPostByGroupId.mockResolvedValue(posts[0]);
      let result = await postDataController.handleIndexPosts(posts, true);

      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts);
    });

    it('should delete when [maxPostsExceed=true | posts.length < 50 | group.length > 1 | not any posts older than oldest post in db]', async () => {
      const posts = [];
      for (let i = 1; i <= 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      for (let i = 31; i <= 60; i += 1) {
        posts.push({
          id: i,
          group_id: 2,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      postDao.queryOldestPostByGroupId.mockImplementation(arg => {
        if (arg === 1) {
          return posts[9];
        }
        if (arg === 2) {
          return posts[39];
        }
      });

      let result = await postDataController.handleIndexPosts(posts, true);

      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts.slice(9, 30).concat(posts.slice(39, 60)));
    });

    it('should delete when [maxPostsExceed=true | posts.length < 50 | group.length > 1 | not any posts older than oldest post in db]', async () => {
      const posts = [];
      for (let i = 1; i <= 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      for (let i = 31; i <= 60; i += 1) {
        posts.push({
          id: i,
          group_id: 2,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      postDao.queryOldestPostByGroupId.mockImplementation(arg => {
        if (arg === 1) {
          return posts[9];
        }
        if (arg === 2) {
          return posts[39];
        }
      });

      let result = await postDataController.handleIndexPosts(posts, true);

      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts.slice(9, 30).concat(posts.slice(39, 60)));
    });

    it('should delete when [maxPostsExceed=true | posts.length < 50 | group.length > 1 | not any posts older than oldest post in db]', async () => {
      const posts = [];
      for (let i = 1; i <= 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      for (let i = 31; i <= 60; i += 1) {
        posts.push({
          id: i,
          group_id: 2,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      postDao.queryOldestPostByGroupId.mockImplementation(arg => {
        if (arg === 1) {
          return posts[9];
        }
        if (arg === 2) {
          return posts[39];
        }
      });

      let result = await postDataController.handleIndexPosts(posts, true);

      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts.slice(9, 30).concat(posts.slice(39, 60)));
    });

    it('should delete when [maxPostsExceed=true | posts.length < 50 | group.length > 1 | not any posts older than oldest post in db]', async () => {
      const posts = [];
      for (let i = 1; i <= 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      for (let i = 31; i <= 60; i += 1) {
        posts.push({
          id: i,
          group_id: 2,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      postDao.queryOldestPostByGroupId.mockImplementation(arg => {
        if (arg === 1) {
          return posts[9];
        }
        if (arg === 2) {
          return posts[39];
        }
      });

      let result = await postDataController.handleIndexPosts(posts, true);

      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts.slice(9, 30).concat(posts.slice(39, 60)));
    });

    it('should filter deactivated posts when [maxPostsExceed=true | has deactivated posts]', async () => {
      const posts = [];
      for (let i = 1; i <= 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i,
          deactivated: i % 4 === 0 ? true : false,
        });
      }
      deactivatedDao.bulkPut.mockResolvedValueOnce({});
      postDao.bulkDelete.mockResolvedValueOnce({});
      let result = await postDataController.handleIndexPosts(posts, true);

      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts.filter((post: Post) => !post.deactivated));
    });
  });

  describe('handleSexioPosts()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
      jest
        .spyOn(mockEntitySourceController, 'bulkDelete')
        .mockResolvedValueOnce({});
    });

    it('should not save modified posts if not exist in local', async () => {
      const posts = [];
      for (let i = 1; i < 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      mockEntitySourceController.getEntityLocally.mockImplementation(arg => {
        return arg % 2 === 0 ? posts[arg - 1] : null;
      });
      let result = await postDataController.handleSexioPosts(posts);

      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts.filter((post: Post) => post.id % 2 === 0));
    });

    it('should save modified posts if not exist in local', async () => {
      const posts = [];
      for (let i = 1; i < 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      mockEntitySourceController.getEntityLocally.mockImplementation(arg => {
        return posts[arg - 1];
      });
      let result = await postDataController.handleSexioPosts(posts);

      result = _.orderBy(result, 'id', 'asc');
      expect(result).toEqual(posts);
    });
  });

  describe('filterAndSavePosts()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return not deactivated posts', async () => {
      const data = [
        { id: 3, group_id: 1, deactivated: false },
        { id: 4, group_id: 2, deactivated: true },
      ];
      const result = await postDataController.filterAndSavePosts(data, false);
      expect(result).toEqual([{ id: 3, group_id: 1, deactivated: false }]);
    });

    it('should return empty if all posts deactivated', async () => {
      const data = [
        { id: 3, group_id: 1, deactivated: true },
        { id: 4, group_id: 2, deactivated: true },
      ];
      const result = await postDataController.filterAndSavePosts(data, false);
      expect(result).toEqual([]);
    });

    it('should return all posts if posts not include deactivated', async () => {
      const data = [
        { id: 3, group_id: 1, deactivated: false },
        { id: 4, group_id: 2, deactivated: false },
      ];
      const result = await postDataController.filterAndSavePosts(data, false);
      expect(result).toEqual(data);
    });
  });
});
