import CompanyDao from '../../../dao/company';
import CompanyAPI from '../../../api/glip/company';
import handleData from '../handleData';

import CompanyService from '../index';

it('CompanyService', () => {
  const comapnyService = new CompanyService();
  expect(CompanyService.serviceName).toBe('CompanyService');
  expect(comapnyService.DaoClass).toEqual(CompanyDao);
  expect(comapnyService.ApiClass).toEqual(CompanyAPI);
  expect(comapnyService.handleData).toEqual(handleData);
});
