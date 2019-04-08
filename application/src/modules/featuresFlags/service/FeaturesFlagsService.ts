/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-18 18:50:30
 * Copyright © RingCentral. All rights reserved.
 */

import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import { RCInfoService } from 'sdk/module/rcInfo';

class FeaturesFlagsService {
  // prettier-ignore
  private _permissionService = PermissionService.getInstance<PermissionService>();
  private _rcInfoService = RCInfoService.getInstance<RCInfoService>();

  canUseTelephony = async () => {
    return (
      (await this._rcInfoService.isVoipCallingAvailable()) &&
      (await this._permissionService.hasPermission(
        UserPermissionType.JUPITER_CAN_USE_TELEPHONY,
      ))
    );
  }
}

export { FeaturesFlagsService };
