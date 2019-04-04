/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 14:05:14
 * Copyright © RingCentral. All rights reserved.
 */

type RCPermission = {
  id?: string;
  uri?: string;
};

type RCEffectiveRole = {
  id?: string;
  uri?: string;
};

type RCRolePermission = {
  permission?: RCPermission;
  effectiveRole?: RCEffectiveRole;
  scope?: string;
};

type RCRolePermissions = {
  permissions?: RCRolePermission[];
  uri?: string;
};

export { RCRolePermissions, RCRolePermission, RCPermission };
