/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-06 13:22:43
 */
import { BaseDao } from '../../framework/dao';
import { MyState } from '../../models';
import { IDatabase } from 'foundation';

class StateDao extends BaseDao<MyState> {
  static COLLECTION_NAME = 'state';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(StateDao.COLLECTION_NAME, db);
  }

  getFirst(): Promise<MyState | null> {
    return this.createQuery().first();
  }
}

export default StateDao;
