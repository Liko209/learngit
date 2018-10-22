import CompanyDao from '../';
import { setup } from '../../__tests__/utils';
import { Company } from '../../../models';
import { companyFactory } from '../../../__tests__/factories';

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
