/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 13:02:05
 * Copyright © RingCentral. All rights reserved.
 */

import CompanyAPI from '../../api/glip/company';
import { CompanyDao } from '../../dao';
import { Company } from '../../models';
import BaseService from '../BaseService';
import { SOCKET } from '../eventKey';
import handleData from './handleData';

export default class CompanyService extends BaseService<Company> {
  static serviceName = 'CompanyService';

  constructor() {
    const subscriptions = {
      [SOCKET.COMPANY]: handleData,
    };
    super(CompanyDao, CompanyAPI, handleData, subscriptions);
  }
}

export { CompanyService };
