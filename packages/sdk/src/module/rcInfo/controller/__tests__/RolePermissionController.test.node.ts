/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-21 19:07:08
 * Copyright © RingCentral. All rights reserved.
 */

import { RolePermissionController } from '../RolePermissionController';

describe('RolePermissionController', () => {
  let rolePermissionController: RolePermissionController;
  const mockFetchController = {
    getRCRolePermissions: jest.fn(),
  } as any;
  beforeEach(() => {
    rolePermissionController = new RolePermissionController(
      mockFetchController,
    );
  });

  describe('hasPermission()', () => {
    it('should return true when has permission', async () => {
      mockFetchController.getRCRolePermissions.mockReturnValueOnce({
        permissions: [
          {
            permission: {
              id: 123,
            },
          },
        ],
      });
      expect(
        await rolePermissionController.hasPermission(123 as any),
      ).toBeTruthy();
    });
  });
});
