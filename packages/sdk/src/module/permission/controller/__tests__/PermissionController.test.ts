/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-22 15:49:27
 * Copyright © RingCentral. All rights reserved.
 */
import { PermissionController } from '../PermissionController';
import { SplitIOController } from '../splitIO/SplitIOController';
import { LaunchDarklyController } from '../launchDarkly/LaunchDarklyController';
import UserPermissionType from '../../types';
jest.mock('../splitIO/SplitIOController');
jest.mock('../launchDarkly/LaunchDarklyController');

describe('PermissionController', () => {
  describe('constructor', () => {
    it('should create splitIOController instance', () => {
      const controller = new PermissionController();
      expect(controller['splitIOController']).toBeInstanceOf(SplitIOController);
      expect(controller['launchDarklyController']).toBeInstanceOf(
        LaunchDarklyController,
      );
    });
  });
  describe('getById', () => {
    it('should return user permission', async () => {
      const controller = new PermissionController();
      const mockValue = {
        JUPITER_CREATE_TEAM: true,
        JUPITER_SEND_NEW_MESSAGE: false,
      };
      jest
        .spyOn(controller, '_getAllPermissions')
        .mockResolvedValueOnce(mockValue);
      const result = await controller.getById(1);
      expect(result.id).toEqual(1);
      expect(result.permissions).toEqual(mockValue);
    });
  });
  describe('hasPermission', () => {
    const splitIOController = new SplitIOController(() => {});
    const launchDarklyController = new LaunchDarklyController(() => {});
    let permissionController: PermissionController;
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      permissionController = new PermissionController();
      Object.assign(permissionController, {
        splitIOController,
        launchDarklyController,
      });
    });

    it('should only read permission from LD for JUPITER_CREATE_TEAM', async () => {
      launchDarklyController.hasPermission = jest
        .fn()
        .mockReturnValueOnce(false);
      splitIOController.hasPermission = jest.fn().mockReturnValueOnce(true);
      const result = await permissionController.hasPermission(
        UserPermissionType.JUPITER_CREATE_TEAM,
      );
      expect(result).toBeFalsy();
    });
    it('should only read permission from split for JUPITER_SEND_NEW_MESSAGE', async () => {
      launchDarklyController.hasPermission = jest
        .fn()
        .mockReturnValueOnce(true);
      splitIOController.hasPermission = jest.fn().mockReturnValueOnce(false);
      const result = await permissionController.hasPermission(
        UserPermissionType.JUPITER_SEND_NEW_MESSAGE,
      );
      expect(result).toBeFalsy();
    });
    it('should read permission both from split and LD - 1', async () => {
      launchDarklyController.hasPermission = jest
        .fn()
        .mockReturnValueOnce(true);
      splitIOController.hasPermission = jest.fn().mockReturnValueOnce(false);
      const result = await permissionController.hasPermission(
        UserPermissionType.JUPITER_CAN_SAVE_LOG,
      );
      expect(result).toBeTruthy();
    });
    it('should read permission both from split and LD - 2', async () => {
      launchDarklyController.hasPermission = jest
        .fn()
        .mockReturnValueOnce(false);
      splitIOController.hasPermission = jest.fn().mockReturnValueOnce(true);
      const result = await permissionController.hasPermission(
        UserPermissionType.JUPITER_CAN_SAVE_LOG,
      );
      expect(result).toBeTruthy();
    });
    it('should read permission both from split and LD - 3', async () => {
      launchDarklyController.hasPermission = jest
        .fn()
        .mockReturnValueOnce(false);
      splitIOController.hasPermission = jest.fn().mockReturnValueOnce(false);
      const result = await permissionController.hasPermission(
        UserPermissionType.JUPITER_CAN_SAVE_LOG,
      );
      expect(result).toBeFalsy();
    });
  });
});
