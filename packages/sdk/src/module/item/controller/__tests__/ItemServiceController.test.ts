/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-15 08:56:17
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemServiceController } from '../ItemServiceController';
import { IItemService } from '../../service/IItemService';
import { Item } from '../../entity';
import { ISubItemService } from '../../module/base/service/ISubItemService';
import { SubItemServiceRegister } from '../../config';
import { ItemDao } from '../../dao';
import { daoManager } from '../../../../dao';
import { ItemUtils } from '../../utils';

jest.mock('../../dao');
jest.mock('../../config');
jest.mock('../../module/base/service/ISubItemService');
jest.mock('../../../../framework/controller');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ItemServiceController', () => {
  const fileTypeId = 10;
  let subItemService: ISubItemService = undefined;
  const itemDao = new ItemDao(null);

  const itemService = {} as IItemService;

  const itemServiceController = new ItemServiceController(itemService, null);
  const subServices: Map<number, ISubItemService> = new Map();

  function setUp() {
    daoManager.getDao = jest.fn().mockReturnValue(itemDao);
    itemDao.put = jest.fn();

    subItemService = {
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      createItem: jest.fn(),
      getSubItemsCount: jest.fn(),
      getSortedIds: jest.fn(),
    };

    subServices.set(fileTypeId, subItemService);

    SubItemServiceRegister.buildSubItemServices = jest
      .fn()
      .mockReturnValue(subServices);

    Object.assign(itemServiceController, {
      _subItemServices: subServices,
    });
  }

  beforeEach(async () => {
    clearMocks();
    setUp();
  });

  const validItem = {
    id: 10,
    post_ids: [1, 2, 3],
  } as Item;

  const invalidItem = {
    id: -10,
  } as Item;

  describe('getGroupItemsCount', () => {
    const cnt = 11111;
    const groupId = 111;
    beforeEach(() => {
      clearMocks();
      setUp();

      subItemService.getSubItemsCount = jest.fn().mockResolvedValue(cnt);
    });
    it('should return 0 when can not find the sub service', async () => {
      const res = await itemServiceController.getGroupItemsCount(
        groupId,
        111,
        undefined,
      );
      expect(res).toBe(0);
    });

    it('should return right count when can find the sub service', async () => {
      const res = await itemServiceController.getGroupItemsCount(groupId, 10);
      expect(res).toBe(cnt);
    });
  });

  describe('getItems', () => {
    const item1 = { id: 1, name: '1' };
    const item2 = { id: 2, name: '2' };
    const item3 = { id: 3, name: '3' };
    beforeEach(() => {
      clearMocks();
      setUp();
      subItemService.getSortedIds = jest.fn().mockResolvedValue([1, 3, 2]);
      itemDao.getItemsByIds = jest
        .fn()
        .mockResolvedValue([item1, item2, item3]);
    });

    it('should return sorted items', async () => {
      const options = {
        typeId: fileTypeId,
        groupId: 111,
      };
      const res = await itemServiceController.getItems(options);
      expect(subItemService.getSortedIds).toBeCalledWith(options);
      expect(res).toEqual([item1, item3, item2]);
    });
  });

  describe('createItem', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should create item and its sanitized item when item is valid', async () => {
      expect.assertions(2);
      await itemServiceController.createItem(validItem);
      expect(itemDao.put).toBeCalledWith(validItem);
      expect(subItemService.createItem).toBeCalledWith(validItem);
    });

    it('should create item and but dont create its sanitized item when item is invalid', async () => {
      expect.assertions(2);
      await itemServiceController.createItem(invalidItem);
      expect(itemDao.put).toBeCalledWith(invalidItem);
      expect(subItemService.createItem).not.toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should update item and its sanitized item when item is valid', async () => {
      expect.assertions(2);
      await itemServiceController.updateItem(validItem);
      expect(itemDao.update).toBeCalledWith(validItem);
      expect(subItemService.updateItem).toBeCalledWith(validItem);
    });

    it('should update item and but dont update its sanitized item when item is invalid', async () => {
      expect.assertions(2);
      await itemServiceController.updateItem(invalidItem);
      expect(itemDao.update).toBeCalledWith(invalidItem);
      expect(subItemService.updateItem).not.toHaveBeenCalled();
    });
  });

  describe('deleteItem', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should delete item and its sanitized item when item is valid', async () => {
      expect.assertions(2);
      await itemServiceController.deleteItem(validItem.id);
      expect(itemDao.delete).toBeCalledWith(validItem.id);
      expect(subItemService.deleteItem).toBeCalledWith(validItem.id);
    });

    it('should update item and but dont update its sanitized item when item is invalid', async () => {
      expect.assertions(2);
      await itemServiceController.deleteItem(invalidItem.id);
      expect(itemDao.delete).toBeCalledWith(invalidItem.id);
      expect(subItemService.deleteItem).not.toBeCalledWith(invalidItem.id);
    });
  });
});
