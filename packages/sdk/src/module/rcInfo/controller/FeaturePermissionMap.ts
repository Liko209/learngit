/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-28 15:08:51
 * Copyright © RingCentral. All rights reserved.
 */
import {
  PermissionId,
  ERCServiceFeaturePermission,
  RCServiceFeatureName,
} from '../types';

const FEATURE_PERMISSION_MAP_VALUE: [ERCServiceFeaturePermission, {}][] = [
  [
    ERCServiceFeaturePermission.VOIP_CALLING,
    {
      featureName: RCServiceFeatureName.VOIP_CALLING,
    },
  ],
  [
    ERCServiceFeaturePermission.INTERNATIONAL_CALLING,
    {
      featureName: RCServiceFeatureName.INTERNATIONAL_CALLING,
      permissionId: PermissionId.INTERNATIONAL_CALLS,
    },
  ],
  [
    ERCServiceFeaturePermission.ON_DEMAND_CALL_RECORDING,
    {
      featureName: RCServiceFeatureName.ON_DEMAND_CALL_RECORDING,
    },
  ],
  [
    ERCServiceFeaturePermission.CALL_PARK,
    {
      featureName: RCServiceFeatureName.CALL_PARK,
    },
  ],
  [
    ERCServiceFeaturePermission.CALL_TRANSFER,
    {
      featureName: RCServiceFeatureName.SINGLE_EXTENSION_UI,
    },
  ],
  [
    ERCServiceFeaturePermission.CALL_FLIP,
    {
      featureName: RCServiceFeatureName.SINGLE_EXTENSION_UI,
    },
  ],
  [
    ERCServiceFeaturePermission.CALL_FORWARDING,
    {
      featureName: RCServiceFeatureName.CALL_FORWARDING,
    },
  ],
  [
    ERCServiceFeaturePermission.INTERNAL_CALLS,
    {
      permissionId: PermissionId.INTERNAL_CALLS,
    },
  ],
  [
    ERCServiceFeaturePermission.DOMESTIC_CALLS,
    {
      permissionId: PermissionId.DOMESTIC_CALLS,
    },
  ],
  [
    ERCServiceFeaturePermission.READ_COMPANY_CALLLOG,
    {
      permissionId: PermissionId.READ_COMPANY_CALLLOG,
    },
  ],
  [
    ERCServiceFeaturePermission.CALL_SWITCH,
    {
      featureName: RCServiceFeatureName.CALL_SWITCH,
    },
  ],
  [
    ERCServiceFeaturePermission.PAGER_SEND,
    {
      featureName: RCServiceFeatureName.PAGER,
      permissionId: PermissionId.INTERNAL_SMS,
    },
  ],
  [
    ERCServiceFeaturePermission.FAX,
    {
      featureName: RCServiceFeatureName.FAX,
    },
  ],
  [
    ERCServiceFeaturePermission.VIDEO_CONFERENCING,
    {
      featureName: RCServiceFeatureName.VIDEO_CONFERENCING,
      permissionId: PermissionId.PERMISSION_MEEINGS,
    },
  ],
  [
    ERCServiceFeaturePermission.CONFERENCING,
    {
      featureName: RCServiceFeatureName.CONFERENCING,
    },
  ],
  [
    ERCServiceFeaturePermission.READ_BLOCKED_PHONE_NUMBER,
    {
      permissionId: PermissionId.READ_BLOCKED_NUMBER,
    },
  ],
  [
    ERCServiceFeaturePermission.EDIT_BLOCKED_PHONE_NUMBER,
    {
      permissionId: PermissionId.EDIT_BLOCKED_NUMBER,
    },
  ],
  [
    ERCServiceFeaturePermission.READ_CALLLOG,
    {
      permissionId: PermissionId.READ_CALLLOG,
    },
  ],
  [
    ERCServiceFeaturePermission.READ_MESSAGES,
    {
      permissionId: PermissionId.READ_MESSAGES,
    },
  ],
  [
    ERCServiceFeaturePermission.WEB_PHONE,
    {
      featureName: RCServiceFeatureName.WEB_PHONE,
    },
  ],
  [
    ERCServiceFeaturePermission.ORGANIZE_CONFERENCE,
    {
      permissionId: PermissionId.ORGANIZE_CONFERENCE,
    },
  ],
  [
    ERCServiceFeaturePermission.RC_PRESENCE,
    {
      featureName: RCServiceFeatureName.PRESENCE,
    },
  ],
  [
    ERCServiceFeaturePermission.RC_PRESENCE,
    {
      featureName: RCServiceFeatureName.PRESENCE,
    },
  ],
];

export { FEATURE_PERMISSION_MAP_VALUE };
