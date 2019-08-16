/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-24 14:22:30
 * Copyright © RingCentral. All rights reserved.
 */
import { IPermissionController } from '../../controller/IPermissionController';
import { UserPermissionType } from '../..';
import { PermissionServiceHelper } from '../PermissionServiceHelper';

class mockController implements IPermissionController {
  async hasPermission(type: UserPermissionType): Promise<boolean> {
    return type === UserPermissionType.CAN_SHOW_NOTE;
  }
  async getFeatureFlag(type: UserPermissionType): Promise<number | string> {
    return type;
  }
  isFlagSupported(type: UserPermissionType): boolean {
    return type !== UserPermissionType.JUPITER_CREATE_TEAM;
  }
  setCallback(callback: () => void): void {}
}

describe('PermissionServiceHelper', () => {
  const helper = new PermissionServiceHelper();
  describe('injectControllers', () => {
    it('should be empty before calling injectControllers', () => {
      expect(helper['controllers'].length).toEqual(0);
    });
    it('should not be empty after calling injectControllers', () => {
      helper.injectControllers(new mockController());
      expect(helper['controllers'].length).toEqual(1);
    });
  });
  describe('getById', () => {
    it('should return all permission', async () => {
      const result = await helper.getById(10);
      expect(Object.keys(result.permissions).length).not.toEqual(0);
      expect(result.permissions[UserPermissionType.CAN_SHOW_NOTE]).toBeTruthy();
      expect(
        result.permissions[UserPermissionType.JUPITER_CAN_SHOW_IMAGE_DIALOG],
      ).toBeFalsy();
    });
  });
  describe('getFeatureFlag', () => {
    it('should return default flag if is not supported', async () => {
      expect(
        await helper.getFeatureFlag(UserPermissionType.JUPITER_CREATE_TEAM),
      ).toEqual(-1);
    });
    it('should return flag if feature is supported', async () => {
      expect(
        await helper.getFeatureFlag(UserPermissionType.CAN_SHOW_NOTE),
      ).toEqual(UserPermissionType.CAN_SHOW_NOTE);
    });
  });
  describe('hasPermission', () => {
    it('should return false when feature is not supported', async () => {
      expect(
        await helper.hasPermission(UserPermissionType.JUPITER_CREATE_TEAM),
      ).toBeFalsy();
    });

    it('should return false when feature is not supported', async () => {
      expect(
        await helper.hasPermission(UserPermissionType.JUPITER_CAN_SAVE_LOG),
      ).toBeFalsy();
      expect(
        await helper.hasPermission(UserPermissionType.CAN_SHOW_NOTE),
      ).toBeTruthy();
    });
  });
});
