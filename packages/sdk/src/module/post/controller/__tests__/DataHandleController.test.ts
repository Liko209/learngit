/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-24 09:58:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemService } from '../../../item';
import { PostDao, ItemDao, daoManager } from '../../../../dao';
import { ExtendedBaseModel } from '../../../models';
import { IPreInsertController } from '../../../common/controller/interface/IPreInsertController';
import { PROGRESS_STATUS } from '../../../progress';
import { DataHandleController } from '../DataHandleController';
import { Item } from '../../../item/entity';
import { Post } from '../../entity';

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

describe('DataHandleController', () => {
  const itemService = new ItemService();
  const postDao = new PostDao(null);
  const itemDao = new ItemDao(null);
  const preInsertController = new MockPreInsertController();
  const dataHandleController = new DataHandleController(
    preInsertController,
    null,
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

    it('should do nothing if data is null', async () => {
      const result = await dataHandleController.handleFetchedPosts(
        null,
        false,
        (posts: Post[], items: Item[]) => {},
      );
      const filterAndSavePosts = jest.spyOn(
        dataHandleController,
        'filterAndSavePosts',
      );
      expect(filterAndSavePosts).not.toBeCalled();
      expect(itemService.handleIncomingData).not.toBeCalled();
    });

    it('should go through data handle process if data is not null', async () => {
      const data = {
        posts: [{ id: 3, group_id: 1 }, { id: 4, group_id: 2 }],
        items: [{ id: 12 }, { id: 23 }],
        hasMore: false,
      };
      const result = await dataHandleController.handleFetchedPosts(
        data,
        false,
        (posts: Post[], items: Item[]) => {},
      );
      expect(itemService.handleIncomingData).toBeCalled();
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
      const result = await dataHandleController.filterAndSavePosts(data, false);
      expect(result).toEqual([{ id: 3, group_id: 1, deactivated: false }]);
    });

    it('should return empty if all posts deactivated', async () => {
      const data = [
        { id: 3, group_id: 1, deactivated: true },
        { id: 4, group_id: 2, deactivated: true },
      ];
      const result = await dataHandleController.filterAndSavePosts(data, false);
      expect(result).toEqual([]);
    });

    it('should return all posts if posts not include deactivated', async () => {
      const data = [
        { id: 3, group_id: 1, deactivated: false },
        { id: 4, group_id: 2, deactivated: false },
      ];
      const result = await dataHandleController.filterAndSavePosts(data, false);
      expect(result).toEqual(data);
    });
  });
});
