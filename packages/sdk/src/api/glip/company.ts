/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-27 10:21:00
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../api';
import { Company } from '../../models';

class CompanyAPI extends Api {
  /**
   * @param {*} id  company id
   * return company or null
   */
  static basePath = '/company';
  static requestCompanyById(id: number) {
    return this.getDataById<Company>(id);
  }
}

export default CompanyAPI;
