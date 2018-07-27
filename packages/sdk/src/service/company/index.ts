/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-07 14:15:40
 */

import { BaseService } from '../../service';
import { CompanyDao } from '../../dao';
import { Company } from '../../models';
import CompanyAPI from '../../api/glip/company';

import { SOCKET } from '../../service/eventKey';
import handleData from './handleData';

export default class CompanyService extends BaseService<Company> {
  static serviceName = 'CompanyService';

  constructor() {
    const subscriptions = {
      [SOCKET.COMPANY]: handleData
    };
    super(CompanyDao, CompanyAPI, handleData, subscriptions);
  }
}
