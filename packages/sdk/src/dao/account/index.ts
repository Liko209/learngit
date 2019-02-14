/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 13:24:11
 */

import { KVStorage } from 'foundation';
import { BaseKVDao } from '../../framework/dao';
import { ACCOUNT_KEYS } from './constants';

class AccountDao extends BaseKVDao {
  static COLLECTION_NAME: string = 'account';
  constructor(kvStorage: KVStorage) {
    super(AccountDao.COLLECTION_NAME, kvStorage, ACCOUNT_KEYS);
  }
}

export default AccountDao;
