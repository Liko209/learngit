/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-24 09:58:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemService } from '../../../item';
import { daoManager, DeactivatedDao } from '../../../../dao';
import { PostDao, PostDiscontinuousDao } from '../../dao';
import { PreInsertController } from '../../../common/controller/impl/PreInsertController';
import { PostDataController } from '../PostDataController';
import { Item } from '../../../item/entity';
import { Post } from '../../entity';
import { EntitySourceController } from '../../../../framework/controller/impl/EntitySourceController';
import { IEntityPersistentController } from '../../../../framework/controller/interface/IEntityPersistentController';
import _ from 'lodash';
import { notificationCenter, ENTITY } from '../../../../service';
import GroupService from '../../../group';
import { GroupConfigService } from '../../../groupConfig';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { AccountUserConfig } from 'sdk/module/account/config/AccountUserConfig';
import { AccountService } from 'sdk/module/account';

jest.mock('../../../../framework/controller/impl/EntitySourceController');
jest.mock('../../../item');
jest.mock('../../../../module/group');
jest.mock('../../../../dao');
jest.mock('../../dao');
jest.mock('../../../../framework/controller');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../group');
jest.mock('sdk/module/account/config/AccountUserConfig');
jest.mock('../../../../module/groupConfig');
jest.mock('../../../common/controller/impl/PreInsertController');

describe('PostDataController', () => {
  const itemService = new ItemService();
  const groupService = new GroupService();
  const groupConfigService = new GroupConfigService();
  const postDao = new PostDao(null);
  const deactivatedDao = new DeactivatedDao(null);
  const postDiscontinuousDao = new PostDiscontinuousDao(null);
  const preInsertController = new PreInsertController();
  const mockEntitySourceController: EntitySourceController<
    Post
  > = new EntitySourceController<Post>(
    {} as IEntityPersistentController<Post>,
    {} as DeactivatedDao,
  );

  const postDataController = new PostDataController(
    groupService,
    groupConfigService,
    preInsertController,
    mockEntitySourceController,
  );

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  function setup() {
    const accountService = new AccountService({} as any);

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return accountService;
        }
        if (config === ServiceConfig.ITEM_SERVICE) {
          return itemService;
        }
      });
    itemService.handleIncomingData = jest.fn();
    groupService.updateHasMore = jest.fn();
    AccountUserConfig.prototype.getGlipUserId.mockReturnValue(5);
    daoManager.getDao.mockImplementation(arg => {
      if (arg === PostDao) {
        return postDao;
      }
      if (arg === DeactivatedDao) {
        return deactivatedDao;
      }
      if (arg === PostDiscontinuousDao) {
        return postDiscontinuousDao;
      }
    });
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

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
      expect(itemService.handleIncomingData).toHaveBeenCalled();
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
      for (let i = 61; i < 110; i += 1) {
        posts.push({ id: i, group_id: 2 });
      }
      postDao.queryPostIdsByGroupId.mockResolvedValue(deleteIds);
      let result = await postDataController.handleIndexPosts(posts, true);
      expect(mockEntitySourceController.bulkDelete).toHaveBeenCalledWith(
        deleteIds,
      );
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
      expect(mockEntitySourceController.bulkDelete).toHaveBeenCalledWith(
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
      expect(mockEntitySourceController.bulkDelete).not.toHaveBeenCalled();
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
      postDao.queryOldestPostCreationTimeByGroupId.mockResolvedValue(posts[10]);
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
      postDao.queryOldestPostCreationTimeByGroupId.mockImplementation(arg => {
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
      postDao.queryOldestPostCreationTimeByGroupId.mockImplementation(arg => {
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
      postDao.queryOldestPostCreationTimeByGroupId.mockImplementation(arg => {
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
      postDao.queryOldestPostCreationTimeByGroupId.mockImplementation(arg => {
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

    it('should delete deactivated modified posts when [maxPostsExceed=false | has modified posts | has deactivated posts]', async () => {
      const posts = [];
      for (let i = 1; i < 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i > 15 ? i : i + 1,
          deactivated: i % 3 === 0,
        });
      }

      const result = await postDataController.handleIndexPosts(posts, true);
      const deactivatedPost = posts.filter(
        (post: Post) =>
          post.created_at !== post.modified_at && post.deactivated,
      );

      expect(deactivatedDao.bulkPut).toHaveBeenCalledWith(deactivatedPost);
      expect(postDiscontinuousDao.bulkDelete).toHaveBeenCalledWith(
        deactivatedPost.map((post: Post) => post.id),
      );
      expect(postDiscontinuousDao.bulkUpdate).toHaveBeenCalledWith(
        posts.filter(
          (post: Post) =>
            post.created_at !== post.modified_at && !post.deactivated,
        ),
        false,
      );
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledWith(
        ENTITY.DISCONTINUOUS_POST,
        posts.filter((post: Post) => post.created_at !== post.modified_at),
      );
    });

    it('should call delete pre-insert if post in pre-insert list', async () => {
      const posts = [];
      for (let i = 1; i <= 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          unique_id: i.toString(),
          created_at: i,
          creator_id: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      for (let i = 31; i <= 60; i += 1) {
        posts.push({
          id: i,
          group_id: 2,
          unique_id: i.toString(),
          created_at: i,
          creator_id: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      postDao.queryOldestPostCreationTimeByGroupId.mockImplementation(arg => {
        if (arg === 1) {
          return posts[3];
        }
        if (arg === 2) {
          return posts[39];
        }
      });
      const spy = jest.spyOn(preInsertController, 'bulkDelete');
      preInsertController.getPreInsertId.mockImplementationOnce(
        (id: string) => {
          if (id === '5') {
            return 5;
          }
          return undefined;
        },
      );
      let result = await postDataController.handleIndexPosts(posts, true);

      result = _.orderBy(result, 'id', 'asc');
      const expectPosts = posts.slice(3, 30).concat(posts.slice(39, 60));
      expect(result).toEqual(expectPosts);
      expect(spy).toHaveBeenCalledWith([posts[4]]);
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

    it('should save modified posts if exist in local', async () => {
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

    it('should delete deactivated modified posts then send DISCONTINUOUS_POST update', async () => {
      const posts = [];
      for (let i = 1; i < 30; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          created_at: i,
          modified_at: i > 15 ? i : i + 1,
          deactivated: i % 3 === 0,
        });
      }
      mockEntitySourceController.getEntityLocally.mockImplementation(arg => {
        return posts[arg - 1];
      });
      const result = await postDataController.handleSexioPosts(posts);

      const deactivatedPost = posts.filter(
        (post: Post) =>
          post.created_at !== post.modified_at && post.deactivated,
      );

      expect(deactivatedDao.bulkPut).toHaveBeenCalledWith(deactivatedPost);
      expect(postDiscontinuousDao.bulkDelete).toHaveBeenCalledWith(
        deactivatedPost.map((post: Post) => post.id),
      );
      expect(postDiscontinuousDao.bulkUpdate).toHaveBeenCalledWith(
        posts.filter(
          (post: Post) =>
            post.created_at !== post.modified_at && !post.deactivated,
        ),
        false,
      );
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledWith(
        ENTITY.DISCONTINUOUS_POST,
        posts.filter((post: Post) => post.created_at !== post.modified_at),
      );
    });

    it('should call delete pre-insert if post in pre-insert list', async () => {
      const posts = [];
      for (let i = 1; i <= 10; i += 1) {
        posts.push({
          id: i,
          group_id: 1,
          unique_id: i.toString(),
          created_at: i,
          creator_id: i,
          modified_at: i % 2 === 0 ? i : i + 1,
        });
      }
      mockEntitySourceController.getEntityLocally.mockImplementation(arg => {
        return posts[arg - 1];
      });
      const spy = jest.spyOn(preInsertController, 'bulkDelete');
      preInsertController.getPreInsertId.mockImplementationOnce(
        (id: string) => {
          if (id === '5') {
            return 5;
          }
          return undefined;
        },
      );
      const result = await postDataController.handleSexioPosts(posts);

      expect(result).toEqual(posts);
      expect(spy).toHaveBeenCalledWith([posts[4]]);
    });
  });

  describe('filterFunc()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return correct order', async () => {
      const data = [
        { id: 3, group_id: 1, deactivated: true },
        { id: 4, group_id: 2, deactivated: true },
        { id: 1, group_id: 2, deactivated: true },
        { id: 2, group_id: 3, deactivated: false },
        { id: 5, group_id: 1, deactivated: true },
      ];
      const result = await postDataController.filterFunc(data);
      const group1 = {
        eventKey: `${ENTITY.POST}.1`,
        entities: [
          { id: 3, group_id: 1, deactivated: true },
          { id: 5, group_id: 1, deactivated: true },
        ],
      };
      const group2 = {
        eventKey: `${ENTITY.POST}.2`,
        entities: [
          { id: 4, group_id: 2, deactivated: true },
          { id: 1, group_id: 2, deactivated: true },
        ],
      };
      const group3 = {
        eventKey: `${ENTITY.POST}.3`,
        entities: [{ id: 2, group_id: 3, deactivated: false }],
      };
      const target = [group1, group2, group3];

      expect(result).toEqual(target);
    });
  });

  describe('transformAndFilterPosts', () => {
    it('should filter sms post', () => {
      const posts = [
        {
          _id: 1,
          is_sms: true,
        },
        {
          _id: 2,
          is_sms: false,
        },
      ];
      const result = postDataController.transformAndFilterPosts(posts as any);
      expect(result).toEqual([posts[1]]);
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
