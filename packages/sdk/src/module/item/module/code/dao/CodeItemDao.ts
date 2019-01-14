/*
 * @Author: Paynter Chen
 * @Date: 2019-01-14 17:47:12
 * Copyright © RingCentral. All rights reserved.
 */

import { SanitizedCodeItem } from '../entity';
import { SubItemDao } from '../../base/dao';
import { IDatabase } from 'foundation';

class CodeItemDao extends SubItemDao<SanitizedCodeItem> {
  static COLLECTION_NAME = 'codeItem';
  constructor(db: IDatabase) {
    super(CodeItemDao.COLLECTION_NAME, db);
  }
}

export { CodeItemDao };
