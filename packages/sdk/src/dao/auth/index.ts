/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-28 00:33:35
 */
import { KVStorage } from 'foundation/db';
import { BaseKVDao } from '../../framework/dao';
import { AUTH_KEYS } from './constants';

class AuthDao extends BaseKVDao {
  static COLLECTION_NAME = 'auth';
  constructor(kvStorage: KVStorage) {
    super(AuthDao.COLLECTION_NAME, kvStorage, AUTH_KEYS);
  }
}

export default AuthDao;
