/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 20:27:29
 * Copyright © RingCentral. All rights reserved.
 */
import { GlobalConfigService } from '../../../config/service/GlobalConfigService';
import { AccountGlobalConfig } from '../AccountGlobalConfig';
import { ACCOUNT_KEYS } from '../configKeys';

jest.mock('../../../config/service/GlobalConfigService');

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

  it('should call get when getUserDictionary', () => {
    AccountGlobalConfig.getUserDictionary();
    expect(mockGlobalConfigService.get).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.USER_DICTIONARY,
    );
  });
  it('should call get when setUserDictionary', () => {
    AccountGlobalConfig.setUserDictionary(123);
    expect(mockGlobalConfigService.put).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.USER_DICTIONARY,
      123,
    );
  });
  it('should call remove when setUserDictionary', () => {
    AccountGlobalConfig.removeUserDictionary();
    expect(mockGlobalConfigService.remove).toHaveBeenCalledWith(
      MODULE,
      ACCOUNT_KEYS.USER_DICTIONARY,
    );
  });
});
