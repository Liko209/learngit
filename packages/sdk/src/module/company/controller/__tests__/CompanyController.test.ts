/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-22 14:44:35
 * Copyright © RingCentral. All rights reserved.
 */

import { CompanyController } from '../CompanyController';
import { transform } from '../../../../service/utils';
import notificationCenter from '../../../../service/notificationCenter';
import { rawCompanyFactory } from '../../../../__tests__/factories';
import { SYNC_SOURCE } from '../../../../module/sync/types';

jest.mock('../../../../framework/controller/impl/EntitySourceController');

jest.mock('../../../../service/utils', () => ({
  transform: jest.fn(),
}));

jest.mock('../../../../service/notificationCenter', () => ({
  emitEntityUpdate: jest.fn(),
}));

const requestController = {
  get: jest.fn(),
};

const entitySourceController = {
  bulkUpdate: jest.fn(),
  get: jest.fn(),
  getRequestController: () => {
    return requestController;
  },
};

describe('CompanyController', () => {
  let companyController: CompanyController = undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    companyController = new CompanyController(entitySourceController);
    Object.assign(companyController, {
      entitySourceController,
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('getCompanyEmailDomain()', () => {
    it('should return company id when webmail_person_id > 0 ', async () => {
      const company = {
        id: 1,
        domain: ['aaa', 'bbb', 'ccc'],
        webmail_person_id: 123,
      };
      entitySourceController.get.mockResolvedValueOnce(company);
      const res = await companyController.getCompanyEmailDomain(company.id);
      expect(res).toBe(company.id.toString());
      expect(entitySourceController.get).toBeCalledWith(company.id);
    });

    it('should return first company domain when webmail_person_id < 0, and has multiple domains', async () => {
      const company = {
        id: 1,
        domain: ['aaa', 'bbb', 'ccc'],
        webmail_person_id: -123,
      };
      entitySourceController.get.mockResolvedValueOnce(company);
      const res = await companyController.getCompanyEmailDomain(company.id);
      expect(res).toBe('aaa');
      expect(entitySourceController.get).toBeCalledWith(company.id);
    });

    it('should return company domain when dont have webmail_person_id  and has one domain', async () => {
      const company = { id: 1, domain: 'ddd' };
      entitySourceController.get.mockResolvedValueOnce(company);
      const res = await companyController.getCompanyEmailDomain(company.id);
      expect(res).toBe('ddd');
      expect(entitySourceController.get).toBeCalledWith(company.id);
    });
  });

  describe('Company Service handleData', () => {
    it('handleData for an empty array', async () => {
      await companyController.handleCompanyData([], SYNC_SOURCE.INITIAL);
      expect(transform).toHaveBeenCalledTimes(0);
      expect(notificationCenter.emitEntityUpdate).not.toHaveBeenCalled();
      expect(entitySourceController.bulkUpdate).not.toHaveBeenCalled();
    });

    it('should emit notification when handleData from index', async () => {
      await companyController.handleCompanyData(
        [
          rawCompanyFactory.build({ _id: 1 }),
          rawCompanyFactory.build({ _id: 2 }),
        ],
        SYNC_SOURCE.INDEX,
      );
      expect(transform).toHaveBeenCalledTimes(2);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
      expect(entitySourceController.bulkUpdate).toHaveBeenCalled();
    });

    it('should not emit notification when handleData from remaining', async () => {
      await companyController.handleCompanyData(
        [
          rawCompanyFactory.build({ _id: 1 }),
          rawCompanyFactory.build({ _id: 2 }),
        ],
        SYNC_SOURCE.REMAINING,
      );
      expect(transform).toHaveBeenCalledTimes(2);
      expect(notificationCenter.emitEntityUpdate).not.toHaveBeenCalled();
      expect(entitySourceController.bulkUpdate).toHaveBeenCalled();
    });
  });
});
