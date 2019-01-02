/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedEventItem } from '../entity';
import { SubItemDao } from './SubItemDao';
import { IDatabase } from 'foundation/src/db';

class EventItemDao extends SubItemDao<SanitizedEventItem> {
  static COLLECTION_NAME = 'eventItem';
  constructor(db: IDatabase) {
    super(EventItemDao.COLLECTION_NAME, db);
  }
}

export { EventItemDao };
