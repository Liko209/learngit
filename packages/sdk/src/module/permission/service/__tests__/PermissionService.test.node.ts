/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-28 16:57:06
 * Copyright © RingCentral. All rights reserved.
 */

import { PermissionService } from '../PermissionService'
import { PermissionServiceHelper } from '../PermissionServiceHelper'
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import UserPermissionType from '../../types';
jest.mock('../PermissionServiceHelper');
describe('PermissionService', () => {

  let helper: PermissionServiceHelper;
  let service: PermissionService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();


    service = new PermissionService();
    helper = new PermissionServiceHelper();
    service['permissionServiceHelper'] = helper;
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {

        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return {
            userConfig: { getGlipUserId: jest.fn().mockReturnValue(1) },
          };
        }
      });

  });

  describe('injectControllers', () => {
    it('should call helper injectControllers', () => {
      service.injectControllers({});
      expect(helper.injectControllers).toHaveBeenCalledTimes(1);
    })
  });
  describe('getUserPermission', () => {
    it('should call helper getById', async () => {
      await service.getUserPermission();
      expect(helper.getById).toHaveBeenCalledWith(1);
    })
  });
  describe('hasPermission', () => {
    it('should call helper hasPermission', async () => {
      await service.hasPermission(UserPermissionType.CAN_MENTION_TEAM);
      expect(helper.hasPermission).toHaveBeenCalledWith(UserPermissionType.CAN_MENTION_TEAM);
    })
  });
  describe('getFeatureFlag', () => {
    it('should call helper getFeatureFlag', async () => {
      await service.hasPermission(UserPermissionType.CAN_MENTION_TEAM);
      expect(helper.hasPermission).toHaveBeenCalledWith(UserPermissionType.CAN_MENTION_TEAM);
    })
  });
  describe('getById', () => {
    it('should call helper getById', async () => {
      await service.getById(2);
      expect(helper.getById).toHaveBeenCalledWith(2);
    })
  });
});
