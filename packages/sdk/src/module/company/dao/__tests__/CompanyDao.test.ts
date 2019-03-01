/*
 * Jerry Cai (jerry.cai@ringcentral.co
 * @Date: 2019-02-22 14:36:00
 * Copyright © RingCentral. All rights reserved.
 */

import { CompanyDao } from '../CompanyDao';
import { setup } from '../../../../dao/__tests__/utils';
import { Company } from '../../entity';
import { companyFactory } from '../../../../__tests__/factories';

describe('Company Dao', () => {
  let companyDao: CompanyDao;

  beforeAll(() => {
    const { database } = setup();
    companyDao = new CompanyDao(database);
  });

  it('Save company', async () => {
    const company: Company = companyFactory.build({ id: 100 });
    await companyDao.put(company);
    const matchedCompany = await companyDao.get(100);
    expect(matchedCompany).toMatchObject(company);
  });
});
