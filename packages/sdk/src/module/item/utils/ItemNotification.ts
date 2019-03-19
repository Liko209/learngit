/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-14 15:16:26
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../entity';
import { ENTITY } from '../../../service/eventKey';
import { GlipTypeUtil } from '../../../utils/glip-type-dictionary';

class ItemNotification {
  static getItemNotificationKey(itemType?: number, groupId?: number): string {
    const typeStr = itemType ? `${itemType}` : '*';
    const groupIdStr = groupId ? `${groupId}` : '*';
    return `${ENTITY.ITEM}.${typeStr}.${groupIdStr}`;
  }

  static getItemsNotifications(
    data: Item[],
  ): { eventKey: string; entities: Item[] }[] {
    const itemGroupMap: Map<
      string,
      { eventKey: string; entities: Item[] }
    > = new Map();
    data.forEach((item: Item) => {
      if (item) {
        const type = GlipTypeUtil.extractTypeId(item.id);
        item.group_ids &&
          item.group_ids.forEach((groupId: number) => {
            const key = `groupId=${groupId},type=${type}`;
            const itemInMap = itemGroupMap.get(key);
            if (itemInMap) {
              itemInMap.entities.push(item);
            } else {
              itemGroupMap.set(key, {
                eventKey: ItemNotification.getItemNotificationKey(
                  type,
                  groupId,
                ),
                entities: [item],
              });
            }
          });
      }
    });

    return Array.from(itemGroupMap.values());
  }
}

export { ItemNotification };
