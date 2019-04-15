/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:58:02
 * Copyright © RingCentral. All rights reserved.
 */

import { EventItem, SanitizedEventItem } from '../entity';
import { BaseSubItemService } from '../../base/service/BaseSubItemService';
import { EventItemDao } from '../dao/EventItemDao';
import { daoManager } from '../../../../../dao';
import { GlipTypeUtil, TypeDictionary } from '../../../../../utils';

class EventItemService extends BaseSubItemService<
  EventItem,
  SanitizedEventItem
> {
  constructor() {
    super(daoManager.getDao<EventItemDao>(EventItemDao));
    this.setCheckTypeFunc((id: number) => {
      return GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_EVENT);
    });
  }
}

export { EventItemService };
