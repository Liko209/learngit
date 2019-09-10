/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-02-25 16:59:29
 * Copyright © RingCentral. All rights reserved.
 */
import { IDatabase } from 'foundation/db';
import { BaseDao } from '../../../framework/dao';
import { Post } from '../entity';

class PostDiscontinuousDao extends BaseDao<Post> {
  static COLLECTION_NAME = 'postDiscontinuous';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PostDiscontinuousDao.COLLECTION_NAME, db);
  }
}

export { PostDiscontinuousDao };
