/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-14 14:09:39
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from '../../../framework/dao';
import { Profile } from '../entity';
import { IDatabase } from 'foundation/db';

class ProfileDao extends BaseDao<Profile> {
  static COLLECTION_NAME = 'profile';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(ProfileDao.COLLECTION_NAME, db);
  }
}

export { ProfileDao };
