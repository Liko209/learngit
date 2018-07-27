/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-05-03 16:23:16
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager, AccountDao } from '../../../dao';
import GroupServiceHandler from '../groupServiceHandler';

jest.mock('../../../utils/mathUtils');
jest.mock('../../../dao', () => {
  return {
    daoManager: {
      getKVDao: jest.fn()
    }
  };
});

jest.mock('../../../utils/mathUtils', () => ({
  versionHash: jest.fn().mockReturnValue(123)
}));

describe('GroupServiceHandler()', () => {
  it('buildNewGroupInfo()', () => {
    // const versionHash.mockReturnValue(123);
    const accountDao = { get: jest.fn() };
    daoManager.getKVDao.mockReturnValue(accountDao);
    daoManager.getKVDao(AccountDao).get.mockReturnValue(1);
    const data = GroupServiceHandler.buildNewGroupInfo([]);
    expect(data).toEqual({
      members: [],
      creator_id: 1,
      is_new: true,
      new_version: 123
    });
  });
});
