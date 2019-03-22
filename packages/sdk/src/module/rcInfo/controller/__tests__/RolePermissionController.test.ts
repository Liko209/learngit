/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-21 19:07:08
 * Copyright © RingCentral. All rights reserved.
 */

import { RolePermissionController } from '../RolePermissionController';

jest.mock('../../config');

describe('RolePermissionController', () => {
  let rolePermissionController: RolePermissionController;

  beforeEach(() => {
    rolePermissionController = new RolePermissionController();
  });

  describe('setRolePermissions()', () => {
    it('should set correct value', () => {
      rolePermissionController.setRolePermissions('permission' as any);
      expect(rolePermissionController['_rolePermissions']).toEqual(
        'permission',
      );
    });
  });

  describe('getRolePermissions()', () => {
    it('should get from config when value is invalid', () => {
      rolePermissionController[ 'rcInfoUserConfig'
].getRolePermissions = jest.fn().mockReturnValue('role');
      expect(rolePermissionController.getRolePermissions()).toEqual('role');
    });
  });

  describe('hasPermission()', () => {
    it('should return true when has permission', () => {
      rolePermissionController['_rolePermissions'] = {
        permissions: [
          {
            permission: {
              id: 123,
            },
          },
        ],
      } as any;
      expect(rolePermissionController.hasPermission(123 as any)).toBeTruthy();
    });
  });
});
