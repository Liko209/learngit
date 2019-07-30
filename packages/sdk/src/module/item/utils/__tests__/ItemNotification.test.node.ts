/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-15 14:21:04
 * Copyright © RingCentral. All rights reserved.
 */

import { ItemNotification } from '../ItemNotification';
import { ENTITY } from '../../../../service/eventKey';
import { Item } from '../../entity';

describe('ItemNotification', () => {
  describe('getItemNotificationKey', () => {
    it('should return correct event key when type id and groupId are provided', () => {
      const result = ItemNotification.getItemNotificationKey(10, 1);
      expect(result).toEqual(`${ENTITY.ITEM}.10.1`);
    });

    it('should return correct event key when type id and groupId are not provided', () => {
      const result = ItemNotification.getItemNotificationKey();
      expect(result).toEqual(`${ENTITY.ITEM}.*.*`);
    });

    it('should return correct event key when type id is provided, but groupId is not ', () => {
      const result = ItemNotification.getItemNotificationKey(10);
      expect(result).toEqual(`${ENTITY.ITEM}.10.*`);
    });

    it('should return correct event key when type id is not provided, but groupId is provided ', () => {
      const result = ItemNotification.getItemNotificationKey(undefined, 1);
      expect(result).toEqual(`${ENTITY.ITEM}.*.1`);
    });
  });

  describe('getItemsNotifications', () => {
    it('should return multiple notifications when item has reference multiple group id', () => {
      const itemFile = {
        id: 10,
        group_ids: [1, 2, 3],
      };
      const target = [
        {
          eventKey: ItemNotification.getItemNotificationKey(10, 1),
          entities: [itemFile],
        },

        {
          eventKey: ItemNotification.getItemNotificationKey(10, 2),
          entities: [itemFile],
        },

        {
          eventKey: ItemNotification.getItemNotificationKey(10, 3),
          entities: [itemFile],
        },
      ];

      const result = ItemNotification.getItemsNotifications([itemFile as Item]);
      expect(result).toEqual(target);
    });

    it('should return empty notifications when item has not group id', () => {
      const itemFile = {
        id: 10,
        group_ids: [],
      };
      const result = ItemNotification.getItemsNotifications([itemFile as Item]);
      expect(result.length).toBe(0);
    });

    it('should return empty notifications when item is empty', () => {
      const result = ItemNotification.getItemsNotifications([]);
      expect(result.length).toBe(0);
    });
  });
});
