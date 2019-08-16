/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 13:24:11
 */

import { KVStorage } from 'foundation/db';
import { BaseKVDao } from '../../framework/dao';
import { ACCOUNT_COLLECTION_NAME, ACCOUNT_KEYS } from './constants';

class AccountDao extends BaseKVDao {
  static COLLECTION_NAME: string = ACCOUNT_COLLECTION_NAME;
  constructor(kvStorage: KVStorage) {
    super(AccountDao.COLLECTION_NAME, kvStorage, ACCOUNT_KEYS);
  }
}

export default AccountDao;
