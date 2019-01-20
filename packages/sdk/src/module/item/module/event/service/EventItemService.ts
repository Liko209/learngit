/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:02
 * Copyright © RingCentral. All rights reserved.
 */

import { IItemService } from '../../../service/IItemService';
import { EventItem, SanitizedEventItem } from '../entity';
import { BaseSubItemService } from '../../base/service/BaseSubItemService';
import { EventItemDao } from '../dao/EventItemDao';
import { daoManager } from '../../../../../dao';
class EventItemService extends BaseSubItemService<
  EventItem,
  SanitizedEventItem
> {
  constructor(itemService: IItemService) {
    super(daoManager.getDao<EventItemDao>(EventItemDao));
  }

  toSanitizedItem(event: EventItem) {
    return {
      ...super.toSanitizedItem(event),
      start: event.start,
      end: event.end,
      effective_end: event.effective_end,
    } as SanitizedEventItem;
  }
}

export { EventItemService };
