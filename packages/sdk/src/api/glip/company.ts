/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-27 10:21:00
 * Copyright © RingCentral. All rights reserved.
 */
import { IResponse } from '../NetworkClient';
import Api from '../api';
import { Company, Raw } from '../../models';

class CompanyAPI extends Api {
  /**
   * @param {*} id  company id
   * return company or null
   */
  static basePath = '/company';
  static requestCompanyById(id: number): Promise<IResponse<Raw<Company>>> {
    return this.getDataById(id);
  }
}

export default CompanyAPI;
