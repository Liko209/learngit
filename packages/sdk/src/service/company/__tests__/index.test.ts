import CompanyDao from '../../../dao/company';
import CompanyAPI from '../../../api/glip/company';
import handleData from '../handleData';

import CompanyService from '../index';

describe('CompanyService', () => {
  let companyService: CompanyService = undefined;

  beforeEach(() => {
    companyService = new CompanyService();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('company service property', () => {
    it('should return right company service property', () => {
      expect(CompanyService.serviceName).toBe('CompanyService');
      expect(companyService.DaoClass).toEqual(CompanyDao);
      expect(companyService.ApiClass).toEqual(CompanyAPI);
      expect(companyService.handleData).toEqual(handleData);
    });
  });

  describe('getCompanyEmailDomain()', () => {
    it('should return company id when webmail_person_id > 0 ', async () => {
      const spy = jest.spyOn(companyService, 'getCompanyById');
      const company = {
        id: 1,
        domain: ['aaa', 'bbb', 'ccc'],
        webmail_person_id: 123,
      };
      spy.mockResolvedValueOnce(company);
      const res = await companyService.getCompanyEmailDomain(company.id);
      expect(res).toBe(company.id.toString());
      expect(spy).toBeCalledWith(company.id);
    });

    it('should return first company domain when webmail_person_id < 0, and has multiple domains', async () => {
      const spy = jest.spyOn(companyService, 'getCompanyById');
      const company = {
        id: 1,
        domain: ['aaa', 'bbb', 'ccc'],
        webmail_person_id: -123,
      };
      spy.mockResolvedValueOnce(company);
      const res = await companyService.getCompanyEmailDomain(company.id);
      expect(res).toBe('aaa');
      expect(spy).toBeCalledWith(company.id);
    });

    it('should return company domain when dont have webmail_person_id  and has one domain', async () => {
      const spy = jest.spyOn(companyService, 'getCompanyById');
      const company = { id: 1, domain: 'ddd' };
      spy.mockResolvedValueOnce(company);
      const res = await companyService.getCompanyEmailDomain(company.id);
      expect(res).toBe('ddd');
      expect(spy).toBeCalledWith(company.id);
    });
  });
});
