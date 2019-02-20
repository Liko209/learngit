/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 17:35:35
 * Copyright © RingCentral. All rights reserved.
 */

import { RcInfoController } from '../RcInfoController';
import { RcInfoApi } from '../../../../api/ringcentral/RcInfoApi';
import { daoManager } from '../../../../dao';

describe('RcInfoController', () => {
  let rcInfoController: RcInfoController;
  let mockPut = jest.fn();
  let mockGet = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    mockPut = jest.fn();
    mockGet = jest.fn();
    daoManager.getKVDao = jest.fn().mockReturnValue({
      put: mockPut,
      get: mockGet,
    });
    rcInfoController = new RcInfoController();
  });

  describe('requestRcInfo()', () => {
    it('should call correct function', () => {
      mockGet.mockReturnValue('RC');
      rcInfoController.requestRcClientInfo = jest.fn();
      rcInfoController.requestRcAccountInfo = jest.fn();
      rcInfoController.requestRcExtensionInfo = jest.fn();
      rcInfoController.requestRcRolePermission = jest.fn();
      rcInfoController.requestRcInfo();
      expect(rcInfoController.requestRcClientInfo).toBeCalledTimes(1);
      expect(rcInfoController.requestRcAccountInfo).toBeCalledTimes(1);
      expect(rcInfoController.requestRcExtensionInfo).toBeCalledTimes(1);
      expect(rcInfoController.requestRcRolePermission).toBeCalledTimes(1);
    });

    it('should call correct function', () => {
      mockGet.mockReturnValue('GLIP');
      rcInfoController.requestRcClientInfo = jest.fn();
      rcInfoController.requestRcAccountInfo = jest.fn();
      rcInfoController.requestRcExtensionInfo = jest.fn();
      rcInfoController.requestRcRolePermission = jest.fn();
      rcInfoController.requestRcInfo();
      expect(rcInfoController.requestRcClientInfo).toBeCalledTimes(0);
      expect(rcInfoController.requestRcAccountInfo).toBeCalledTimes(0);
      expect(rcInfoController.requestRcExtensionInfo).toBeCalledTimes(0);
      expect(rcInfoController.requestRcRolePermission).toBeCalledTimes(0);
    });
  });

  describe('requestRcClientInfo()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcClientInfo = jest.fn().mockReturnValue({
        expect: jest.fn().mockReturnValue('rcClientInfo'),
      });
      await rcInfoController.requestRcClientInfo();
      expect(RcInfoApi.requestRcClientInfo).toBeCalledTimes(1);
      expect(mockPut).toBeCalledWith('client_info', 'rcClientInfo');
    });
  });

  describe('requestRcAccountInfo()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcAccountInfo = jest.fn().mockReturnValue({
        expect: jest.fn().mockReturnValue('rcAccountInfo'),
      });
      await rcInfoController.requestRcAccountInfo();
      expect(RcInfoApi.requestRcAccountInfo).toBeCalledTimes(1);
      expect(mockPut).toBeCalledWith('account_info', 'rcAccountInfo');
    });
  });

  describe('requestRcExtensionInfo()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcExtensionInfo = jest.fn().mockReturnValue({
        expect: jest.fn().mockReturnValue('rcExtensionInfo'),
      });
      await rcInfoController.requestRcExtensionInfo();
      expect(RcInfoApi.requestRcExtensionInfo).toBeCalledTimes(1);
      expect(mockPut).toBeCalledWith('extension_info', 'rcExtensionInfo');
    });
  });

  describe('requestRcRolePermission()', () => {
    it('should send request and save to storage', async () => {
      RcInfoApi.requestRcRolePermission = jest.fn().mockReturnValue({
        expect: jest.fn().mockReturnValue('rcRolePermission'),
      });
      await rcInfoController.requestRcRolePermission();
      expect(RcInfoApi.requestRcRolePermission).toBeCalledTimes(1);
      expect(mockPut).toBeCalledWith('role_permission', 'rcRolePermission');
    });
  });
});
