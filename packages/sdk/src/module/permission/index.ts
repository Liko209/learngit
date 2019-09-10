/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-21 14:47:26
 * Copyright © RingCentral. All rights reserved.
 */
import { PermissionService } from './service/PermissionService';
import UserPermissionType, { FeatureFlagType } from './types';
import { IPermissionController } from './controller/IPermissionController';
import { AbstractPermissionController } from './controller/AbstractPermissionController';

export {
  PermissionService,
  UserPermissionType,
  IPermissionController,
  FeatureFlagType,
  AbstractPermissionController
};
