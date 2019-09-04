/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 17:35:35
 * Copyright © RingCentral. All rights reserved.
 */

import { RCPermissionController } from '../RCPermissionController';
import { ERCServiceFeaturePermission } from '../../types';
import { RolePermissionController } from '../RolePermissionController';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { FULL_RC_PERMISSION_JSON } from './FullRCPermissionData';
import { E_ACCOUNT_TYPE } from 'sdk/module/company/entity';

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
    let accoutType = E_ACCOUNT_TYPE.RC_OFFICE;
    beforeEach(() => {
      clearMocks();
      ServiceLoader.getInstance = jest.fn().mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(true),
      });
      ServiceLoader.getInstance = jest.fn().mockImplementation(config => {
        if (config === ServiceConfig.PERMISSION_SERVICE) {
          return {
            hasPermission: jest.fn().mockReturnValue(true),
          };
        }
        if (config === ServiceConfig.COMPANY_SERVICE) {
          return {
            getUserAccountTypeFromSP430: jest.fn().mockReturnValue(accoutType),
          };
        }
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
    it('should return true when user has forward permission', async () => {
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: FULL_RC_PERMISSION_JSON.serviceFeatures,
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.CALL_FORWARDING,
      );
      expect(res).toBeTruthy();
    });
    it('should return false when user has not flip permission', async () => {
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: FULL_RC_PERMISSION_JSON.serviceFeatures,
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.CALL_FLIP,
      );
      expect(res).toBeFalsy();
    });
    it('should return true when user has park permission', async () => {
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: FULL_RC_PERMISSION_JSON.serviceFeatures,
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.CALL_PARK,
      );
      expect(res).toBeTruthy();
    });

    it('should return false when user is fax users', async () => {
      accoutType = E_ACCOUNT_TYPE.RC_FAX;
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.VOIP_CALLING,
      );
      expect(res).toBeFalsy();
    });

    it('should return true when user is rc pro', async () => {
      accoutType = E_ACCOUNT_TYPE.RC_MOBILE;
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: FULL_RC_PERMISSION_JSON.serviceFeatures,
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.VOIP_CALLING,
      );
      expect(res).toBeTruthy();
    });

    it('should return true when users have on-demand call recording permission', async () => {
      mockFetchController.getRCExtensionInfo.mockReturnValueOnce({
        serviceFeatures: FULL_RC_PERMISSION_JSON.serviceFeatures,
      });
      const res = await rcPermissionController.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.ON_DEMAND_CALL_RECORDING,
      );
      expect(res).toBeTruthy();
    });

    it.each`
      rolePermissions | serviceFeatures                                                                            | permission                                  | result   | comment
      ${[]}           | ${[{ featureName: 'SMS', enabled: true }, { featureName: 'VoipCalling', enabled: false }]} | ${ERCServiceFeaturePermission.VOIP_CALLING} | ${false} | ${'has sms permission, no voip permission'}
      ${[]}           | ${[{ featureName: 'CallSwitch', enabled: true }]}                                          | ${ERCServiceFeaturePermission.CALL_SWITCH}  | ${true}  | ${'has call switch permission'}
      ${[]}           | ${[{ featureName: 'CallSwitch', enabled: false }]}                                         | ${ERCServiceFeaturePermission.CALL_SWITCH}  | ${false} | ${'no call switch permission'}
      ${[]}           | ${[{ featureName: 'WebPhone', enabled: true }]}                                            | ${ERCServiceFeaturePermission.WEB_PHONE}    | ${true}  | ${'has web phone permission'}
      ${[]}           | ${[{ featureName: 'WebPhone', enabled: false }]}                                           | ${ERCServiceFeaturePermission.WEB_PHONE}    | ${false} | ${'no web phone permission'}
      ${[]}           | ${[{ featureName: 'Presence', enabled: true }]}                                            | ${ERCServiceFeaturePermission.RC_PRESENCE}  | ${true}  | ${'has rc presence permission'}
      ${[]}           | ${[{ featureName: 'Presence', enabled: false }]}                                           | ${ERCServiceFeaturePermission.RC_PRESENCE}  | ${false} | ${'has no rc presence permission'}
    `(
      'should return $result when $comment',
      async ({ rolePermissions, serviceFeatures, permission, result }) => {
        mockFetchController.getRCRolePermissions.mockReturnValueOnce({
          permissions: rolePermissions,
        });

        mockFetchController.getRCExtensionInfo = jest
          .fn()
          .mockResolvedValueOnce({
            serviceFeatures,
          });
        const res = await rcPermissionController.isRCFeaturePermissionEnabled(
          permission,
        );
        expect(res).toBe(result);
      },
    );

    it('should return false when users ', async () => {
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
  });
});
