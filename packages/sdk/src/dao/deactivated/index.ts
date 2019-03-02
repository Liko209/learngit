/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-17 10:40:21
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseDao } from '../../framework/dao';
import { IDatabase } from 'foundation';

class DeactivatedDao extends BaseDao<any> {
  static COLLECTION_NAME = 'deactivated';
  constructor(db: IDatabase) {
    super(DeactivatedDao.COLLECTION_NAME, db);
  }
}

export default DeactivatedDao;
