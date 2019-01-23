/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-21 13:15:35
 * Copyright © RingCentral. All rights reserved.
 */

import UserPermissionType from '../types';

interface IPermissionService {
  hasPermission(type: UserPermissionType): Promise<boolean>;
}

export { IPermissionService };
