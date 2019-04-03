/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:02
 * Copyright © RingCentral. All rights reserved.
 */

import { EventItem, SanitizedEventItem } from '../entity';
import { BaseSubItemService } from '../../base/service/BaseSubItemService';
import { EventItemDao } from '../dao/EventItemDao';
import { daoManager } from '../../../../../dao';
class EventItemService extends BaseSubItemService<
  EventItem,
  SanitizedEventItem
> {
  constructor() {
    super(daoManager.getDao<EventItemDao>(EventItemDao));
  }
}

export { EventItemService };
