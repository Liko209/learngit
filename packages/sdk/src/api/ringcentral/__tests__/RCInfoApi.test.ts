/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 16:39:53
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoApi } from '../RCInfoApi';
import { NETWORK_VIA, HA_PRIORITY } from 'foundation';

jest.mock('../../api');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCInfoApi', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('requestRCAPIVersion()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.requestRCAPIVersion();
      expect(RCInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('requestRCClientInfo()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.requestRCClientInfo();
      expect(RCInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/client-info',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('requestRCAccountInfo()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.requestRCAccountInfo();
      expect(RCInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('requestRCExtensionInfo()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.requestRCExtensionInfo();
      expect(RCInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~/extension/~',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('requestRCRolePermission()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.requestRCRolePermissions();
      expect(RCInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~/extension/~/authz-profile',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('getSpecialNumbers()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.getSpecialNumbers('mockRequest' as any);
      expect(RCInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/client-info/special-number-rule',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        params: 'mockRequest',
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('getPhoneParserData()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.getPhoneParserData('9.9');
      expect(RCInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/number-parser/phonedata.xml',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        headers: {
          Accept: 'application/xml',
          'If-None-Match': '"9.9"',
        },
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('getDialingPlan()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.getDialingPlan('mockRequest' as any);
      expect(RCInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~/dialing-plan',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        params: 'mockRequest',
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('getAccountServiceInfo', () => {
    beforeEach(() => {
      clearMocks();
    });

    it('should be called with correct params', async () => {
      await RCInfoApi.getAccountServiceInfo();
      expect(RCInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~/service-info',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('getExtensionPhoneNumberList()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.getExtensionPhoneNumberList('mockRequest' as any);
      expect(RCInfoApi.rcNetworkClient.http).toBeCalledWith({
        path: '/v1.0/account/~/extension/~/phone-number',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        params: 'mockRequest',
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });
});
