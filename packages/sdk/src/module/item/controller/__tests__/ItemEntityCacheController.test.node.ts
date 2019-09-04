/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-29 16:12:11
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemEntityCacheController } from '../ItemEntityCacheController';
import { Item } from '../../entity';

describe('ItemEntityCacheController', () => {
  describe('buildItemEntityCacheController', () => {
    it('should build a new cache controller', () => {
      const a = ItemEntityCacheController.buildItemEntityCacheController(2);
      expect(a instanceof ItemEntityCacheController).toBeTruthy();
    });
  });
  describe('clear', () => {
    it('should cache map', () => {
      const a = ItemEntityCacheController.buildItemEntityCacheController(2);
      a.putInternal(
        {
          id: 11,
          type_id: 20
        } as Item);

      expect(a['_typeIdMap'].get(20)).toEqual([11]);
      a.clear();
      expect(a['_typeIdMap'].get(20)).toEqual(undefined);
    });
  });
  describe('putInternal', () => {
    it('should create new id and array if incomes new type items', async () => {
      const a = ItemEntityCacheController.buildItemEntityCacheController(2);
      expect(await a.get(1)).toBeNull();
      expect(a['_typeIdMap'].get(10)).toEqual(undefined);
      const item1 = {
        id: 1,
        type_id: 10,
      } as Item;
      a.putInternal(item1);
      expect(await a.get(1)).toEqual(item1);
      expect(a['_typeIdMap'].get(10)).toEqual([1]);
    })
    it('should remove the oldest value if items size has over threshold', async () => {
      const a = ItemEntityCacheController.buildItemEntityCacheController(2);
      expect(a['_typeIdMap'].get(10)).toEqual(undefined);
      a.putInternal(
        {
          id: 1,
          type_id: 10
        } as Item);
      expect(a['_typeIdMap'].get(10)).toEqual([1]);
      a.putInternal(
        {
          id: 2,
          type_id: 10
        } as Item);

      expect(a['_typeIdMap'].get(10)).toEqual([1, 2]);

      a.putInternal(
        {
          id: 3,
          type_id: 10
        } as Item);

      expect(a['_typeIdMap'].get(10)).toEqual([2, 3]);
      expect(a['_typeIdMap'].get(20)).toEqual(undefined);

      a.putInternal(
        {
          id: 11,
          type_id: 20
        } as Item);

      expect(a['_typeIdMap'].get(20)).toEqual([11]);
      expect(a['_typeIdMap'].get(10)).toEqual([2, 3]);
    });
  });
})
