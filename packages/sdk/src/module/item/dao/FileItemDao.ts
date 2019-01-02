/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-2 15:50:00
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedFileItem } from '../entity';
import { BaseDao } from '../../../dao';
import { IDatabase } from 'foundation/src/db';

class FileItemDao extends BaseDao<SanitizedFileItem> {
  static COLLECTION_NAME = 'fileItem';
  constructor(db: IDatabase) {
    super(FileItemDao.COLLECTION_NAME, db);
  }
}

export { FileItemDao };
