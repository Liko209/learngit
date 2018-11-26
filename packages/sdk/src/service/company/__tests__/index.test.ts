import CompanyDao from '../../../dao/company';
import CompanyAPI from '../../../api/glip/company';
import handleData from '../handleData';

import CompanyService from '../index';
import { components } from 'react-select';

describe('CompanyService', () => {
  const companyService: CompanyService = new CompanyService();

  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('getReplyToDomain', async () => {
    const spy = jest.spyOn(companyService, 'getCompanyById');
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should return webmail_person_id when has', async () => {
      const company = { id: 1, webmail_person_id: 123 };
      spy.mockResolvedValueOnce(company);
      const res = await companyService.getReplyToDomain(company.id);
      expect(res).toBe(company.webmail_person_id.toString());
      expect(spy).toBeCalledWith(company.id);
    });

    it('should return first company domain when dont have webmail_person_id, and has multiple domains', async () => {
      const company = { id: 1, domain: '["aaa", "bbb", "ccc"]' };
      spy.mockResolvedValueOnce(company);
      const res = await companyService.getReplyToDomain(company.id);
      expect(res).toBe('aaa');
      expect(spy).toBeCalledWith(company.id);
    });

    it('should return company domain when dont have webmail_person_id  and has one domain', async () => {
      const company = { id: 1, domain: '["ddd"]' };
      spy.mockResolvedValueOnce(company);
      const res = await companyService.getReplyToDomain(company.id);
      expect(res).toBe('ddd');
      expect(spy).toBeCalledWith(company.id);
    });
  });
});
