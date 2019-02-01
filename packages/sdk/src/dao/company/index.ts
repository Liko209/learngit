/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 23:26:14
 */
import { BaseDao } from '../base';
import { Company } from '../../module/company/entity';
import { IDatabase } from 'foundation';

class CompanyDao extends BaseDao<Company> {
  static COLLECTION_NAME = 'company';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(CompanyDao.COLLECTION_NAME, db);
  }
}

export default CompanyDao;
