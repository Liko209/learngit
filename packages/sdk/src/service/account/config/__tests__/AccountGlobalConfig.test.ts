/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 20:27:29
 * Copyright © RingCentral. All rights reserved.
 */
import { GlobalConfigService } from '../../../../module/config/service/GlobalConfigService';
import { AccountGlobalConfig } from '../AccountGlobalConfig';

jest.mock('../../../../module/config/service/GlobalConfigService');

describe('AccountGlobalConfig', () => {
  let mockGlobalConfigService;
  beforeAll(() => {
    mockGlobalConfigService = {
      get: jest.fn(),
      put: jest.fn(),
    };
    GlobalConfigService.getInstance = jest
      .fn()
      .mockReturnValue(mockGlobalConfigService);
  });
  it('should call get when getCurrentUserProfileId', () => {
    AccountGlobalConfig.getCurrentUserProfileId();
    expect(mockGlobalConfigService.get).toBeCalled();
  });

  it('should call set when setCurrentUserProfileId', () => {
    AccountGlobalConfig.setCurrentUserProfileId(123);
    expect(mockGlobalConfigService.put).toBeCalled();
  });
  it('should call get when getClientId', () => {
    AccountGlobalConfig.getClientId();
    expect(mockGlobalConfigService.get).toBeCalled();
  });
  it('should call get when setClientId', () => {
    AccountGlobalConfig.setClientId(123);
    expect(mockGlobalConfigService.put).toBeCalled();
  });
  it('should call get when getCurrentCompanyId', () => {
    AccountGlobalConfig.getCurrentCompanyId();
    expect(mockGlobalConfigService.get).toBeCalled();
  });
  it('should call get when setCurrentCompanyId', () => {
    AccountGlobalConfig.setCurrentCompanyId(123);
    expect(mockGlobalConfigService.put).toBeCalled();
  });
  it('should call get when getCurrentUserId', () => {
    AccountGlobalConfig.getCurrentUserId();
    expect(mockGlobalConfigService.get).toBeCalled();
  });
  it('should call get when setCurrentUserId', () => {
    AccountGlobalConfig.setCurrentUserId(123);
    expect(mockGlobalConfigService.put).toBeCalled();
  });
});
