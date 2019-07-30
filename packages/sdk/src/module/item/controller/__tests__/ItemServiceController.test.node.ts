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
import { EntitySourceController } from '../../../../framework/controller/impl/EntitySourceController';
import { EntityPersistentController } from '../../../../framework/controller/impl/EntityPersistentController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';

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

  let entitySourceController: IEntitySourceController<Item>;

  let itemServiceController: ItemServiceController;
  const subServices: Map<number, ISubItemService> = new Map();

  function setUp() {
    daoManager.getDao = jest.fn().mockReturnValue(itemDao);
    itemDao.put = jest.fn();

    subItemService = {
      getSubItemsCount: jest.fn(),
      getSortedIds: jest.fn(),
    };

    entitySourceController = new EntitySourceController(
      new EntityPersistentController<Item>(itemDao),
      itemDao,
    );
    itemServiceController = new ItemServiceController(
      itemService,
      entitySourceController,
    );

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
      entitySourceController.batchGet = jest
        .fn()
        .mockResolvedValue([item1, item3, item2]);
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

  describe('getItemIndexInfo', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      subItemService.getSortedIds = jest
        .fn()
        .mockResolvedValue([1, 3, 2, 4, 5]);
    });

    it('should return index info', async () => {
      const options = {
        typeId: fileTypeId,
        groupId: 111,
      };
      const itemId = 3;
      const res = await itemServiceController.getItemIndexInfo(itemId, options);
      expect(subItemService.getSortedIds).toBeCalledWith(options);
      expect(res).toEqual({ index: 1, totalCount: 5 });
    });
  });
});
