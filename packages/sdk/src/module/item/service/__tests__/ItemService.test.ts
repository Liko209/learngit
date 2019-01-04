/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-04 14:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemService } from '../ItemService';
import { ItemServiceController } from '../../controller/ItemServiceController';

describe('PostController', () => {
  let itemService: ItemService;
  let itemServiceController: ItemServiceController;

  beforeEach(() => {
    itemService = new ItemService();
    itemServiceController = new ItemServiceController();
  });

  describe('getItems()', () => {
    it('should controller with correct parameter', async () => {
      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      itemServiceController.getItems = jest.fn();

      itemService.getItems(1, 1, 10, 10, 'name', true);

      expect(itemServiceController.getItems).toBeCalledWith(
        1,
        1,
        10,
        10,
        'name',
        true,
      );
    });
  });

  describe('createItem()', () => {
    it('should controller with correct parameter', async () => {
      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      itemServiceController.createItem = jest.fn();

      await itemService.createItem({
        id: -1,
        created_at: 1234,
        modified_at: 1234,
        creator_id: 2222,
        is_new: false,
        deactivated: false,
        version: 1,
        group_ids: [1],
        post_ids: [1],
        company_id: 1,
        name: 'test name',
        type_id: 1,
        type: 'jpg',
        versions: [],
      });

      expect(itemServiceController.createItem).toBeCalledWith({
        id: -1,
        created_at: 1234,
        modified_at: 1234,
        creator_id: 2222,
        is_new: false,
        deactivated: false,
        version: 1,
        group_ids: [1],
        post_ids: [1],
        company_id: 1,
        name: 'test name',
        type_id: 1,
        type: 'jpg',
        versions: [],
      });
    });
  });

  describe('updateItem()', () => {
    it('should controller with correct parameter', async () => {
      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      itemServiceController.updateItem = jest.fn();

      await itemService.updateItem({
        id: 1,
        created_at: 1234,
        modified_at: 1234,
        creator_id: 2222,
        is_new: false,
        deactivated: false,
        version: 1,
        group_ids: [1],
        post_ids: [1],
        company_id: 1,
        name: 'test name',
        type_id: 1,
        type: 'jpg',
        versions: [],
      });
      expect(itemServiceController.updateItem).toBeCalledWith({
        id: 1,
        created_at: 1234,
        modified_at: 1234,
        creator_id: 2222,
        is_new: false,
        deactivated: false,
        version: 1,
        group_ids: [1],
        post_ids: [1],
        company_id: 1,
        name: 'test name',
        type_id: 1,
        type: 'jpg',
        versions: [],
      });
    });
  });

  describe('deleteItem()', () => {
    it('should controller with correct parameter', async () => {
      Object.assign(itemService, {
        _itemServiceController: itemServiceController,
      });

      itemServiceController.deleteItem = jest.fn();

      itemService.deleteItem(1);

      expect(itemServiceController.deleteItem).toBeCalledWith(1);
    });
  });
});
