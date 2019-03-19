/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 14:05:14
 * Copyright © RingCentral. All rights reserved.
 */

type RcPermission = {
  id?: string;
  uri?: string;
};

type RcEffectiveRole = {
  id?: string;
  uri?: string;
};

type RcRolePermission = {
  permission?: RcPermission;
  effectiveRole?: RcEffectiveRole;
  scope?: string;
};

type RcRolePermissions = {
  permissions?: RcRolePermission[];
  uri?: string;
};

export { RcRolePermissions, RcRolePermission, RcPermission };
