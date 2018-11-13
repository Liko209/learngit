/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-10 13:34:40
 * Copyright © RingCentral. All rights reserved
*/

import { daoManager, CompanyDao } from '../../../dao';
import notificationCenter from '../../../service/notificationCenter';
import { transform } from '../../../service/utils';
import handleData from '../handleData';
import { rawCompanyFactory } from '../../../__tests__/factories';

jest.mock('../../../service/notificationCenter', () => ({
  emitEntityUpdate: jest.fn(),
}));

// jest.mock('../../../dao', () => ({
//   daoManager: {
//     getDao: jest.fn().mockImplementation(() => ({
//       bulkPut: jest.fn()
//     }))
//   }
// }));

jest.mock('../../../service/utils', () => ({
  transform: jest.fn(),
}));

describe('Company Service handleData', () => {
  const dao = {
    bulkPut: jest.fn(),
  };
  beforeEach(() => {
    daoManager.getDao = jest.fn().mockReturnValue(dao);
    dao.bulkPut.mockClear();
  });
  it('handleData for an empty array', async () => {
    await handleData([]);
    expect(transform).toHaveBeenCalledTimes(0);
    expect(notificationCenter.emitEntityUpdate).not.toHaveBeenCalled();
    expect(daoManager.getDao(CompanyDao).bulkPut).not.toHaveBeenCalled();
  });

  it('handleData for an normal array', async () => {
    await handleData([rawCompanyFactory.build({ _id: 1 }), rawCompanyFactory.build({ _id: 2 })]);
    expect(transform).toHaveBeenCalledTimes(2);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
    expect(daoManager.getDao(CompanyDao).bulkPut).toHaveBeenCalled();
  });
});
