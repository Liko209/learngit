/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-02-27 08:19:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemService } from '../../../item';
import { ItemDao } from '../../../item/dao';
import { daoManager, DeactivatedDao } from '../../../../dao';
import { PostDao } from '../../dao';
import { EntitySourceController } from '../../../../framework/controller/impl/EntitySourceController';
import PostAPI from '../../../../api/glip/post';
import { GroupService } from '../../../../module/group/service';
import { DiscontinuousPostController } from '../DiscontinuousPostController';

jest.mock('../../../../dao');
jest.mock('../../dao');
jest.mock('../../../../framework/controller');
jest.mock('../../../item');
jest.mock('../../../../api/glip/post');
jest.mock('../../../../framework/controller/impl/EntitySourceController');
jest.mock('../PostDataController');

const postDao = new PostDao(null);
const itemDao = new ItemDao(null);
const deactivatedDao = new DeactivatedDao(null);

const entitySourceController = new EntitySourceController<Post>(null, null);
const itemService = new ItemService();
const groupService = {
  hasMorePostInRemote: jest.fn(),
  updateHasMore: jest.fn(),
};

function setup() {
  ItemService.getInstance = jest.fn().mockReturnValue(itemService);
  itemService.handleIncomingData = jest.fn();
  GroupService.getInstance = jest.fn().mockReturnValue(groupService);
  daoManager.getDao.mockImplementation(arg => {
    if (arg === DeactivatedDao) {
      return deactivatedDao;
    }
    if (arg === ItemDao) {
      return itemDao;
    }
  });
}

describe('DiscontinuousPostController', () => {
  const discontinuousPostController = new DiscontinuousPostController(
    entitySourceController,
  );

  describe('getPostsByIds', () => {
    it('should return all posts if there are all exist in local', async () => {
      setup();
      itemService.getByPosts.mockResolvedValueOnce([]);
      discontinuousPostController.entitySourceController.getEntitiesLocally.mockResolvedValueOnce(
        [{ id: 1 }, { id: 2 }],
      );
      const result = await discontinuousPostController.getPostsByIds([1, 2]);
      expect(result.posts.length).toEqual(2);
    });

    it('should request posts if there are not all exist in local', async () => {
      setup();
      itemService.getByPosts.mockResolvedValueOnce([]);
      discontinuousPostController.entitySourceController.getEntitiesLocally.mockResolvedValueOnce(
        [{ id: 1 }],
      );
      const data = {
        posts: [{ _id: 2 }],
        items: [],
      };
      const mockNormal = data;
      PostAPI.requestByIds.mockResolvedValueOnce(mockNormal);
      const result = await discontinuousPostController.getPostsByIds([1, 2]);
      expect(result.posts).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should mock posts if not loaded post from local and server', async () => {
      setup();
      itemService.getByPosts.mockResolvedValueOnce([]);
      discontinuousPostController.entitySourceController.getEntitiesLocally.mockResolvedValueOnce(
        [{ id: 1 }],
      );
      const data = {
        posts: [{ _id: 2 }],
        items: [],
      };
      const mockNormal = data;
      PostAPI.requestByIds.mockResolvedValueOnce(mockNormal);
      const result = await discontinuousPostController.getPostsByIds([1, 2, 3]);
      expect(deactivatedDao.bulkUpdate).toHaveBeenCalledWith([
        { id: 3, deactivated: true },
      ]);
      expect(result.posts).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should save deactivated/normal post into db when load post from server', async () => {
      setup();
      itemService.getByPosts.mockResolvedValueOnce([]);
      discontinuousPostController.entitySourceController.getEntitiesLocally.mockResolvedValueOnce(
        [{ id: 1, deactivated: false }, { id: 5, deactivated: true }],
      );
      const data = {
        posts: [
          { id: 2, deactivated: false },
          { id: 3, deactivated: true },
          { id: 4, deactivated: false },
        ],
        items: [],
      };
      const mockNormal = data;
      PostAPI.requestByIds.mockResolvedValueOnce(mockNormal);
      const result = await discontinuousPostController.getPostsByIds([
        1,
        2,
        3,
        4,
        5,
        6,
      ]);
      expect(entitySourceController.bulkUpdate).toHaveBeenCalledWith([
        { id: 2, deactivated: false },
        { id: 4, deactivated: false },
      ]);
      expect(deactivatedDao.bulkUpdate).toHaveBeenCalledWith([
        { id: 3, deactivated: true },
        { id: 6, deactivated: true },
      ]);
      expect(result.posts).toEqual([
        { id: 1, deactivated: false },
        { id: 2, deactivated: false },
        { id: 4, deactivated: false },
      ]);
    });
  });
});
