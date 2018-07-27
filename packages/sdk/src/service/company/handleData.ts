/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager } from '../../dao';
import CompanyDao from '../../dao/company';
import notificationCenter from '../../service/notificationCenter';
import { ENTITY } from '../../service/eventKey';
import { transform } from '../utils';
import { Company, Raw } from '../../models';

const companyHandleData = async (companies: Raw<Company>[]) => {
  if (companies.length === 0) {
    return;
  }
  const transformedData: Company[] = companies.map(item => transform<Company>(item));
  const companyDao = daoManager.getDao(CompanyDao);
  notificationCenter.emitEntityPut(ENTITY.COMPANY, transformedData);
  await companyDao.bulkPut(transformedData);
};

export default companyHandleData;
