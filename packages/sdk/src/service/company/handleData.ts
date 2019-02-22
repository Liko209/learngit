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
import { Company } from '../../module/company/entity';
import { Raw } from '../../framework/model';
import CompanyAPI from '../../api/glip/company';

const _getTransformData = async (
  companies: Raw<Company>[],
): Promise<Company[]> => {
  const transformedData: (Company | null)[] = await Promise.all(
    companies.map(async (item: Raw<Company>) => {
      const { _delta: delta, _id: id } = item;
      let finalItem = item;
      if (delta && id) {
        try {
          finalItem = await CompanyAPI.requestCompanyById(id);
        } catch (error) {
          return null;
        }
      }
      return transform<Company>(finalItem);
    }),
  );
  return transformedData.filter(
    (item: Company | null) => item !== null,
  ) as Company[];
};

const companyHandleData = async (companies: Raw<Company>[]) => {
  if (companies.length === 0) {
    return;
  }
  // const transformedData: Company[] = companies.map(item => transform<Company>(item));
  const transformedData: Company[] = await _getTransformData(companies);
  const companyDao = daoManager.getDao(CompanyDao);
  notificationCenter.emitEntityUpdate(ENTITY.COMPANY, transformedData);
  await companyDao.bulkPut(transformedData);
};

export default companyHandleData;
