/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 14:02:24
 */

// import { daoManager } from '../../../dao';
import notificationCenter from '../../../service/notificationCenter';
// import AccountDao from 'dao/account';
import accountHandleData from '../handleData';
import { GlobalConfigService } from '../../../module/config';

jest.mock('../../../module/config');
jest.mock('../../../service/account/config');
GlobalConfigService.getInstance = jest.fn();
jest.mock('../../../service/notificationCenter', () => ({
  emitKVChange: jest.fn(),
}));

jest.mock('../../../dao', () => ({
  daoManager: {
    getDao: jest.fn(() => ({
      put: jest.fn(),
    })),
    getKVDao: jest.fn(() => ({
      put: jest.fn(),
    })),
  },
}));

describe('Account Service handleData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('getCurrentUserId()', async () => {
    accountHandleData({
      userId: 1,
      companyId: 2,
      profileId: 3,
    });
    // const userId = +dao.get(ACCOUNT_USER_ID);
    // const companyId = +dao.get(ACCOUNT_COMPANY_ID);
    // const profileId = +dao.get(ACCOUNT_PROFILE_ID);
    // expect(userId).toBe(1);
    // expect(companyId).toBe(2);
    // expect(profileId).toBe(3);
    expect(notificationCenter.emitKVChange).toHaveBeenCalledTimes(3);
    // expect(daoManager.getDao().put).toHaveBeenCalledTimes(3);
  });

  it('getCurrentUserId()', async () => {
    accountHandleData({
      companyId: 2,
      profileId: 3,
    });
    expect(notificationCenter.emitKVChange).toHaveBeenCalledTimes(2);
  });

  it('getCurrentUserId()', async () => {
    accountHandleData({
      profileId: 3,
    });
    expect(notificationCenter.emitKVChange).toHaveBeenCalledTimes(1);
  });

  it('getCurrentUserId()', async () => {
    accountHandleData({});
    expect(notificationCenter.emitKVChange).toHaveBeenCalledTimes(0);
  });

  it('clientConfig()', async () => {
    accountHandleData({
      clientConfig: { beta_enable_log_emails: [123] },
    });
    expect(notificationCenter.emitKVChange).toHaveBeenCalledTimes(1);
  });
});
