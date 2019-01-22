/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-01-20 11:22:13
 * Copyright © RingCentral. All rights reserved.
 */
import { KVStorage } from 'foundation';
import { BaseKVDao } from '../base';

class VoIPDao extends BaseKVDao {
  static COLLECTION_NAME = 'voip';
  constructor(kvStorage: KVStorage) {
    super(VoIPDao.COLLECTION_NAME, kvStorage, []);
  }
}

export default VoIPDao;
