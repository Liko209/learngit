/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:05:53
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager, ProfileDao } from '../../../dao';
import handleData from '../handleData';
import { profileFactory } from '../../../__tests__/factories';

jest.mock('dao', () => {
  const dao = { get: jest.fn(), bulkPut: jest.fn() };
  return {
    daoManager: {
      getDao: () => dao,
    },
  };
});
const mockAccountService = {
  getCurrentUserProfileId: jest.fn(),
};

jest.mock('service/account', () => {
  class MockAccountService {
    static getInstance() {
      return mockAccountService;
    }
  }

  return MockAccountService;
});

describe('handleData()', () => {
  it('should insert transformed data', async () => {
    mockAccountService.getCurrentUserProfileId.mockImplementation(() => '2');
    daoManager.getDao(ProfileDao).get.mockReturnValue({ id: 1 });
    await handleData([profileFactory.build({ _id: 1 }), profileFactory.build({ _id: 2 })]);
  });

  it('should insert transformed data not profileId', async () => {
    mockAccountService.getCurrentUserProfileId.mockImplementation(() => '');
    await handleData([profileFactory.build({ _id: 1 })]);
  });

  it('should insert nothing', async () => {
    const ret = await handleData([]);
    expect(ret).toBeNull();
  });

  it('should insert but throw error', async () => {
    daoManager.getDao(ProfileDao).bulkPut.mockImplementation(() => {
      throw new Error('error');
    });
    try {
      await handleData([profileFactory.build({ _id: 1 })]);
    } catch (e) {
      expect(e).toEqual(new Error('error'));
    }
  });
});
