/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 09:43:38
 */
import { BaseDao } from '../../framework/dao';
import { Profile } from '../../module/profile/entity';
import { IDatabase } from 'foundation';

class ProfileDao extends BaseDao<Profile> {
  static COLLECTION_NAME = 'profile';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(ProfileDao.COLLECTION_NAME, db);
  }
}

export default ProfileDao;
