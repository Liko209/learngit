/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 16:39:53
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoApi } from '../RCInfoApi';
import { NETWORK_VIA, HA_PRIORITY, REQUEST_PRIORITY } from 'foundation/network';
import { RINGCENTRAL_API } from '../constants';
import {
  IDeviceRequest,
  IAssignLineRequest,
  IUpdateLineRequest,
  ICountryRequest,
} from '../types';

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
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
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
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
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
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
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
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/account/~/extension/~',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('getDeviceInfo', () => {
    it('should be called with correct params', () => {
      const request: IDeviceRequest = { linePooling: 'host' };
      RCInfoApi.getDeviceInfo(request);
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: RINGCENTRAL_API.API_DEVICE_INFO,
        params: request,
        priority: REQUEST_PRIORITY.HIGH,
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('getCountryInfo', () => {
    it('should be called with correct params', () => {
      const request: ICountryRequest = { page: 1, perPage: 500 };
      RCInfoApi.getCountryInfo(request);
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: RINGCENTRAL_API.API_COUNTRY_INFO,
        params: request,
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('assignLine', () => {
    it('should be called with correct params', () => {
      const deviceId = '1';
      const webPhoneId = '2';
      const request: IAssignLineRequest = {
        emergencyServiceAddress: {} as any,
        originalDeviceId: deviceId,
      };
      RCInfoApi.assignLine(webPhoneId, request);
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: `${RINGCENTRAL_API.API_UPDATE_DEVICE}/${webPhoneId}/assign-line`,
        data: request,
        method: 'post',
      });
    });
  });

  describe('updateLine', () => {
    it('should be called with correct params', () => {
      const deviceId = '1';
      const request: IUpdateLineRequest = {
        emergencyServiceAddress: {} as any,
      };
      RCInfoApi.updateLine(deviceId, request);
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: `${RINGCENTRAL_API.API_UPDATE_DEVICE}/${deviceId}`,
        data: request,
        method: 'put',
      });
    });
  });

  describe('requestRCRolePermission()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.requestRCRolePermissions();
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
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
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
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
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
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
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
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
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
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
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/account/~/extension/~/phone-number',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        params: 'mockRequest',
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('getExtensionCallerId()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.getExtensionCallerId();
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/account/~/extension/~/caller-id',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('setExtensionCallerId()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.setExtensionCallerId('mockRequest' as any);
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/account/~/extension/~/caller-id',
        method: 'put',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        data: 'mockRequest',
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('getForwardingNumbers()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.getForwardingNumbers('mockRequest' as any);
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/account/~/extension/~/forwarding-number',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        params: 'mockRequest',
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });
  describe('getBlockNumberList()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.getBlockNumberList('mockRequest' as any);
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/account/~/extension/~/caller-blocking/phone-numbers',
        method: 'get',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        params: 'mockRequest',
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('deleteBlockNumbers()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.deleteBlockNumbers(['123', '456']);
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path:
          '/v1.0/account/~/extension/~/caller-blocking/phone-numbers/123,456',
        method: 'delete',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('addBlockNumbers()', () => {
    it('should be called with correct params', () => {
      RCInfoApi.addBlockNumbers('mockRequest' as any);
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/v1.0/account/~/extension/~/caller-blocking/phone-numbers',
        method: 'post',
        authFree: false,
        via: NETWORK_VIA.HTTP,
        data: 'mockRequest',
        HAPriority: HA_PRIORITY.HIGH,
      });
    });
  });

  describe('getRCPresence', () => {
    it('should be called with correct params', () => {
      RCInfoApi.getRCPresence();
      expect(RCInfoApi.rcNetworkClient.http).toHaveBeenCalledWith({
        authFree: false,
        method: 'get',
        path:
          '/v1.0/account/~/extension/~/presence?detailedTelephonyState=true&sipData=true',
        via: NETWORK_VIA.HTTP,
      });
    });
  });
});
