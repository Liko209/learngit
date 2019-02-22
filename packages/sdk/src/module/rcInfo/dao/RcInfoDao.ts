/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 11:12:57
 * Copyright © RingCentral. All rights reserved.
 */

import { KVStorage } from 'foundation';
import { BaseKVDao } from '../../../framework/dao';
import { RC_INFO_COLLECTION_NAME, RC_INFO_KEYS } from './constants';

class RcInfoDao extends BaseKVDao {
  static COLLECTION_NAME = RC_INFO_COLLECTION_NAME;
  constructor(kvStorage: KVStorage) {
    super(RcInfoDao.COLLECTION_NAME, kvStorage, RC_INFO_KEYS);
  }
}

export { RcInfoDao };
