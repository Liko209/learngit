/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { SanitizedEventItem, EventItem } from '../entity';
import { SubItemDao } from '../../base/dao';
import { IDatabase } from 'foundation/src/db';

class EventItemDao extends SubItemDao<SanitizedEventItem> {
  static COLLECTION_NAME = 'eventItem';
  constructor(db: IDatabase) {
    super(EventItemDao.COLLECTION_NAME, db);
  }

  toSanitizedItem(event: EventItem) {
    return {
      ...super.toSanitizedItem(event),
      start: event.start,
      end: event.end,
      effective_end: event.effective_end,
      repeat: event.repeat,
      repeat_ending: event.repeat_ending,
      repeat_ending_after: event.repeat_ending_after,
      repeat_ending_on: event.repeat_ending_on,
      all_day: event.all_day,
    } as SanitizedEventItem;
  }

  toPartialSanitizedItem(partialItem: Partial<EventItem>) {
    return {
      ...super.toPartialSanitizedItem(partialItem),
      ..._.pick(partialItem, [
        'start',
        'end',
        'effective_end',
        'repeat',
        'repeat_ending',
        'repeat_ending_after',
        'repeat_ending_on',
        'all_day',
      ]),
    };
  }
}

export { EventItemDao };
