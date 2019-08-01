/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-22 13:42:20
 * Copyright © RingCentral. All rights reserved.
 */

import UserPermissionType from '../types';

interface IPermissionController {
  hasPermission(type: UserPermissionType): Promise<boolean>;
  getFeatureFlag(type: UserPermissionType): Promise<number | string>;
  isFlagSupported(type: UserPermissionType): boolean;
  setCallback(callback: () => void): void;
}

export { IPermissionController };
