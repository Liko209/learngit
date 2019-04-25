/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-18 18:50:30
 * Copyright © RingCentral. All rights reserved.
 */

import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
class FeaturesFlagsService {
  private _permissionService = ServiceLoader.getInstance<PermissionService>(
    ServiceConfig.PERMISSION_SERVICE,
  );
  private _rcInfoService = ServiceLoader.getInstance<RCInfoService>(
    ServiceConfig.RC_INFO_SERVICE,
  );

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
