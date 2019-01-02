/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedLinkItem } from '../entity';
import { SubItemDao } from './SubItemDao';
import { IDatabase } from 'foundation/src/db';

class LinkItemDao extends SubItemDao<SanitizedLinkItem> {
  static COLLECTION_NAME = 'linkItem';
  constructor(db: IDatabase) {
    super(LinkItemDao.COLLECTION_NAME, db);
  }
}

export { LinkItemDao };
