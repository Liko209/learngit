/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-22 14:32:04
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from '../../../framework/dao';
import { Company } from '../entity';
import { IDatabase } from 'foundation/db';

class CompanyDao extends BaseDao<Company> {
  static COLLECTION_NAME = 'company';
  constructor(db: IDatabase) {
    super(CompanyDao.COLLECTION_NAME, db);
  }
}

export { CompanyDao };
