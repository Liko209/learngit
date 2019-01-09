/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-07 11:16:41
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager, AccountDao } from '../../../dao';
import { UserConfig } from '../UserConfig';

jest.mock('../../../dao');

describe('UserConfig', () => {
  let accountDao: AccountDao;
  beforeAll(() => {
    accountDao = new AccountDao(null);
    daoManager.getKVDao.mockReturnValue(accountDao);
  });

  describe('getCurrentUserProfileId()', () => {
    it('should return current user profile id', () => {
      accountDao.get.mockReturnValue(111);
      const profileId = UserConfig.getCurrentUserProfileId();
      expect(profileId).toBe(111);
    });

    it('should throw when current user id not found', () => {
      accountDao.get.mockReturnValue('');
      expect(() => UserConfig.getCurrentUserProfileId()).toThrow();
    });
  });

  describe('getCurrentCompanyId()', () => {
    it('should return current user profile id', () => {
      accountDao.get.mockReturnValue(111);
      const profileId = UserConfig.getCurrentCompanyId();
      expect(profileId).toBe(111);
    });

    it('should throw when current user id not found', () => {
      accountDao.get.mockReturnValue('');
      expect(() => UserConfig.getCurrentCompanyId()).toThrow();
    });
  });

  describe('getCurrentUserId()', () => {
    it('should return current user id', () => {
      accountDao.get.mockReturnValue(111);
      const userId = UserConfig.getCurrentUserId();
      expect(userId).toBe(111);
    });

    it('should throw when current user id not found', () => {
      accountDao.get.mockReturnValue('');
      expect(() => UserConfig.getCurrentUserId()).toThrow();
    });
  });
});
