/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 17:35:35
 * Copyright © RingCentral. All rights reserved.
 */

import { RCPermissionController } from '../RCPermissionController';
import { ERCServiceFeaturePermission } from '../../types';
import { RolePermissionController } from '../RolePermissionController';
import { PermissionService } from '../../../permission';
import { ServiceLoader } from '../../../serviceLoader';
jest.mock('../../../permission');
jest.mock('../../config');

describe('RCInfoFetchController', () => {
  let rcPermissionController: RCPermissionController;
  const mockFetchController = {
    getRCExtensionInfo: jest.fn(),
    getRCRolePermissions: jest.fn(),
  } as any;
  const mockRolePermissionController = new RolePermissionController(
    mockFetchController,
  );
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  beforeEach(() => {
    clearMocks();
    rcPermissionController = new RCPermissionController(
      mockFetchController,
      mockRolePermissionController,
    );
  });

  describe('isRCFeaturePermissionEnabled', () => {
    beforeEach(() => {
      clearMocks();
      ServiceLoader.getInstance = jest.fn().mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
      });
    });
    it('should return true when users have calling permission', async () => {
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'VoipCalling', enabled: true },
        ],
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.VOIP_CALLING,
      );
      expect(res).toBe(true);
    });

    it('should return false when users dont have calling permission', async () => {
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'VoipCalling', enabled: false },
        ],
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.VOIP_CALLING,
      );
      expect(res).toBe(false);
    });

    it('should return true when users have permission', async () => {
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'VoipCalling', enabled: false },
        ],
      });
      mockFetchController.getRCRolePermissions.mockReturnValueOnce({
        permissions: [
          { permission: { id: 'test' } },
          { permission: { id: 'ReadCompanyCallLog' } },
        ],
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.READ_COMPANY_CALLLOG,
      );
      expect(res).toBe(true);
    });

    it('should return false when users dont have permission', async () => {
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'VoipCalling', enabled: false },
        ],
      });
      mockFetchController.getRCRolePermissions.mockReturnValueOnce({
        permissions: [
          { permission: { id: 'test' } },
          { permission: { id: 'DND' } },
        ],
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.READ_COMPANY_CALLLOG,
      );
      expect(res).toBe(false);
    });

    it('should return true when users have pager send permission', async () => {
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'Pager', enabled: true },
        ],
      });
      mockFetchController.getRCRolePermissions.mockReturnValueOnce({
        permissions: [
          { permission: { id: 'test' } },
          { permission: { id: 'InternalSMS' } },
        ],
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.PAGER_SEND,
      );
      expect(res).toBe(true);
    });

    it('should return false when users dont have fax permission', async () => {
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: [
          { featureName: 'SMS', enabled: true },
          { featureName: 'Fax', enabled: false },
        ],
      });
      mockFetchController.getRCRolePermissions.mockReturnValueOnce({
        permissions: [
          { permission: { id: 'test' } },
          { permission: { id: 'InternalSMS' } },
        ],
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.FAX,
      );
      expect(res).toBe(false);
    });
  });
});
