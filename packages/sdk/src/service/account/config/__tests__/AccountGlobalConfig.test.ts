/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 20:27:29
 * Copyright © RingCentral. All rights reserved.
 */
import { GlobalConfigService } from '../../../../module/config/service/GlobalConfigService';
import { AccountGlobalConfig } from '../AccountGlobalConfig';
import { ACCOUNT_KEYS } from '../configKeys';
import { jsxEmptyExpression } from '@babel/types';

jest.mock('../../../../module/config/service/GlobalConfigService');

describe('AccountGlobalConfig', () => {
  let mockGlobalConfigService;
  const MODULE = 'account';
  beforeAll(() => {
    mockGlobalConfigService = {
      get: jest.fn(),
      put: jest.fn(),
      remove: jest.fn(),
    };
    GlobalConfigService.getInstance = jest
      .fn()
      .mockReturnValue(mockGlobalConfigService);
  });
  it('should call get when getCurrentUserProfileId', () => {
    AccountGlobalConfig.getCurrentUserProfileId();
    expect(mockGlobalConfigService.get).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.ACCOUNT_PROFILE_ID,
    );
  });

  it('should call set when setCurrentUserProfileId', () => {
    AccountGlobalConfig.setCurrentUserProfileId(123);
    expect(mockGlobalConfigService.put).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.ACCOUNT_PROFILE_ID,
      123,
    );
  });
  it('should call get when getClientId', () => {
    AccountGlobalConfig.getClientId();
    expect(mockGlobalConfigService.get).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.CLIENT_ID,
    );
  });
  it('should call get when setClientId', () => {
    AccountGlobalConfig.setClientId(123);
    expect(mockGlobalConfigService.put).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.CLIENT_ID,
      123,
    );
  });
  it('should call get when getCurrentCompanyId', () => {
    AccountGlobalConfig.getCurrentCompanyId();
    expect(mockGlobalConfigService.get).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.ACCOUNT_COMPANY_ID,
    );
  });
  it('should call get when setCurrentCompanyId', () => {
    AccountGlobalConfig.setCurrentCompanyId(123);
    expect(mockGlobalConfigService.put).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.ACCOUNT_COMPANY_ID,
      123,
    );
  });
  it('should call get when getCurrentUserId', () => {
    AccountGlobalConfig.getCurrentUserId();
    expect(mockGlobalConfigService.get).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.ACCOUNT_USER_ID,
    );
  });
  it('should call get when setCurrentUserId', () => {
    AccountGlobalConfig.setCurrentUserId(123);
    expect(mockGlobalConfigService.put).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.ACCOUNT_USER_ID,
      123,
    );
  });

  it('clear', () => {
    mockGlobalConfigService.get = jest
      .fn()
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(undefined);
    const id = AccountGlobalConfig.getCurrentUserId();
    expect(id).toEqual(2);
    AccountGlobalConfig.clear();
    expect(mockGlobalConfigService.remove).toBeCalledWith(
      MODULE,
      ACCOUNT_KEYS.ACCOUNT_USER_ID,
    );

    expect(AccountGlobalConfig.getCurrentUserId()).toEqual(undefined);
  });
});
