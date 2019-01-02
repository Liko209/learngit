/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedEventItem } from '../entity';
import { BaseDao } from '../../../dao';
import { IDatabase } from 'foundation/src/db';

class EventItemDao extends BaseDao<SanitizedEventItem> {
  static COLLECTION_NAME = 'eventItem';
  constructor(db: IDatabase) {
    super(EventItemDao.COLLECTION_NAME, db);
  }
}

export { EventItemDao };
