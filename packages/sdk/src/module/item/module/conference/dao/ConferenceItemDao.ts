/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-14 23:16:31
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedConferenceItem } from '../entity';
import { SubItemDao } from '../../base/dao';
import { IDatabase } from 'foundation/src/db';

class ConferenceItemDao extends SubItemDao<SanitizedConferenceItem> {
  static COLLECTION_NAME = 'conferenceItem';
  constructor(db: IDatabase) {
    super(ConferenceItemDao.COLLECTION_NAME, db);
  }
}

export { ConferenceItemDao };
