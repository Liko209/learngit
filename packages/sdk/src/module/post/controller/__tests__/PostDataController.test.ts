/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-24 09:58:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemService } from '../../../item';
import { PostDao, ItemDao, daoManager, DeactivatedDao } from '../../../../dao';
import { ExtendedBaseModel } from '../../../models';
import { IPreInsertController } from '../../../common/controller/interface/IPreInsertController';
import { PROGRESS_STATUS } from '../../../progress';
import { PostDataController } from '../PostDataController';
import { Item } from '../../../item/entity';
import { Post } from '../../entity';
import { EntitySourceController } from '../../../../framework/controller/impl/EntitySourceController';
import { IEntityPersistentController } from '../../../../framework/controller/interface/IEntityPersistentController';
import { postFactory, rawPostFactory } from '../../../../__tests__/factories';
import _ from 'lodash';

jest.mock('../../../../framework/controller/impl/EntitySourceController');
jest.mock('../../../item');
jest.mock('../../../../dao');
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
  const itemDao = new ItemDao(null);
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
      if (arg === ItemDao) {
        return itemDao;
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

    it('should return [] when maxPostsExceed=true & post is empty', async () => {
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

    it.only('should not delete when maxPostsExceed=true & post length < 50 & not any posts older than oldest post in db', async () => {
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

    it.only('should delete when [maxPostsExceed=true | posts.length < 50 | group.length = 1 | not any posts older than oldest post in db]', async () => {
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

    it.only('should delete when [maxPostsExceed=true | posts.length < 50 | group.length > 1 | not any posts older than oldest post in db]', async () => {
      const posts = [];
      for (let i = 1; i < 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      for (let i = 31; i < 60; i += 1) {
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
      expect(result).toEqual(posts.slice(9, 30).concat(posts.slice(30, 39)));
    });
  });

  // describe('Post service handleData', () => {
  //   it('maxPostsExceed = false', async () => {
  //     utilsBaseHandleData.mockReturnValue([]);
  //     daoManager.getDao(PostDao).createQuery.mockImplementation(() => ({
  //       count: jest.fn().mockReturnValue(300001),
  //     }));
  //     jest
  //       .spyOn(require('../handleData'), 'handlePreInsertPosts')
  //       .mockResolvedValueOnce([]);

  //     await handleData([rawPostFactory.build({ _id: 1 })], false);
  //     expect(
  //       IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold,
  //     ).toHaveBeenCalled();
  //     expect(
  //       IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange,
  //     ).toHaveBeenCalled();
  //   });

  //   it('maxPostsExceed = true', async () => {
  //     daoManager.getDao(PostDao).createQuery.mockImplementation(() => ({
  //       count: jest.fn().mockReturnValue(299999),
  //     }));
  //     utilsBaseHandleData.mockReturnValue([{ group_id: 123 }]);
  //     await handleData([], true);
  //   });
  // });

  // describe('handleDataFromSexio', () => {
  //   it('empty array', async () => {
  //     const ret = await handleDataFromSexio([]);
  //     expect(ret).toBeUndefined();
  //     expect(
  //       IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange,
  //     ).not.toHaveBeenCalled();
  //   });

  //   it('default data', async () => {
  //     // jest.spyOn(service, 'isVersionInPreInsert').mockReturnValue();
  //     IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange.mockReturnValue(
  //       [{}, {}],
  //     );
  //     await handleDataFromSexio([rawPostFactory.build({ _id: 1 })]);
  //     expect(
  //       IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange,
  //     ).toHaveBeenCalled();
  //     expect(utilsBaseHandleData).toHaveBeenCalled();
  //   });
  //   it('default data', async () => {
  //     IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange.mockReturnValue(
  //       [],
  //     );
  //     await handleDataFromSexio([rawPostFactory.build({ _id: 1 })]);
  //     expect(
  //       IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange,
  //     ).toHaveBeenCalled();
  //     expect(utilsBaseHandleData).not.toHaveBeenCalled();
  //   });
  // });

  //   it('test do not delete', async () => {
  //     const mock = [];
  //     for (let i = 1; i < 60; i += 1) {
  //       mock.push({ id: i, group_id: Math.random() > 0.5 ? 1 : 2 });
  //     }
  //     daoManager
  //       .getDao<PostDao>(null)
  //       .queryPostsByGroupId.mockResolvedValue([]);
  //     const result = await IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold(
  //       mock,
  //       true,
  //     );
  //     expect(result).toEqual(mock);
  //   });

  //   it('test should be delete postid === 1', async () => {
  //     const mock = [];
  //     for (let i = 1; i < 100; i += 1) {
  //       mock.push({ id: i, group_id: Math.random() > 0.5 ? 1 : 2 });
  //     }
  //     daoManager
  //       .getDao<PostDao>(null)
  //       .queryPostsByGroupId.mockResolvedValue([{ id: 1 }]);
  //     const result = await IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold(
  //       mock,
  //       true,
  //     );
  //     mock.shift();
  //     expect(result).toEqual(mock);
  //   });

  //   it('test error', async () => {
  //     const mock = [];
  //     for (let i = 1; i < 100; i += 1) {
  //       mock.push({ id: i, group_id: Math.random() > 0.5 ? 1 : 2 });
  //     }
  //     daoManager
  //       .getDao<PostDao>(null)
  //       .queryPostsByGroupId.mockImplementation(() => {
  //         throw new Error('error msg');
  //       });
  //     const result = await IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold(
  //       mock,
  //       true,
  //     );
  //     expect(result).toEqual([]);
  //   });
  // });

  // it('isGroupPostsDiscontinuous()', () => {
  //   const result1 = IncomingPostHandler.isGroupPostsDiscontinuous([
  //     postFactory.build({
  //       id: 1,
  //       group_id: 1,
  //       created_at: 1,
  //       modified_at: 1,
  //     }),
  //   ]);
  //   expect(result1).toBe(false);
  //   const result2 = IncomingPostHandler.isGroupPostsDiscontinuous([
  //     postFactory.build({
  //       id: 1,
  //       group_id: 1,
  //       created_at: 1,
  //       modified_at: 2,
  //     }),
  //   ]);
  //   expect(result2).toBe(true);
  // });

  // it('removeDiscontinuousPosts()', async () => {
  //   const mock = {
  //     1: [
  //       postFactory.build({
  //         id: 11,
  //         group_id: 1,
  //         created_at: 1,
  //         modified_at: 1,
  //       }),
  //       postFactory.build({
  //         id: 12,
  //         group_id: 1,
  //         created_at: 1,
  //         modified_at: 2,
  //       }),
  //     ],
  //     2: [
  //       postFactory.build({
  //         id: 22,
  //         group_id: 1,
  //         created_at: 1,
  //         modified_at: 2,
  //       }),
  //     ],
  //   };
  //   daoManager
  //     .getDao<PostDao>(null)
  //     .queryOldestPostByGroupId.mockResolvedValueOnce([
  //       postFactory.build({
  //         id: 11,
  //         group_id: 1,
  //         created_at: 1,
  //         modified_at: 1,
  //       }),
  //     ]);
  //   await IncomingPostHandler.removeDiscontinuousPosts(mock);
  //   // TODO figure out why this test don't have any assert
  //   // expect(result1).toBe(false);
  //   // const result2 = IncomingPostHandler
  //   //    .isGroupPostsDiscontinuous([{ created_at: 1, modified_at: 2 }]);
  //   // expect(result2).toBe(true);
  // });

  // it('handleGroupPostsDiscontinuousCausedByModificationTimeChange()', async () => {
  //   const mock = [
  //     postFactory.build({
  //       id: 11,
  //       group_id: 1,
  //       created_at: 1,
  //       modified_at: 1,
  //     }),
  //     postFactory.build({
  //       id: 12,
  //       group_id: 1,
  //       created_at: 1,
  //       modified_at: 2,
  //     }),
  //   ];

  //   const result = await IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange(
  //     mock,
  //   );
  //   expect(result).toEqual([]);
  // });

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
