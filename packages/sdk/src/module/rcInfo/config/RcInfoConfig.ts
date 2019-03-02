/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-03 01:45:13
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfig } from '../../config';
import {
  RcAccountInfo,
  RcClientInfo,
  RcExtensionInfo,
  RcRolePermissions,
} from '../../../api/ringcentral';
import { RC_INFO_COLLECTION_NAME, RC_INFO_KEYS } from '../constants';

class RcInfoConfig extends GlobalConfig {
  static moduleName = RC_INFO_COLLECTION_NAME;

  static setRcAccountInfo(rcAccountInfo: RcAccountInfo) {
    this.put(RC_INFO_KEYS.RC_ACCOUNT_INFO, rcAccountInfo);
  }

  static getRcAccountInfo(): RcAccountInfo {
    return this.get(RC_INFO_KEYS.RC_ACCOUNT_INFO);
  }

  static setRcClientInfo(rcClientInfo: RcClientInfo) {
    this.put(RC_INFO_KEYS.RC_CLIENT_INFO, rcClientInfo);
  }

  static getRcClientInfo(): RcClientInfo {
    return this.get(RC_INFO_KEYS.RC_CLIENT_INFO);
  }

  static setRcExtensionInfo(rcExtensionInfo: RcExtensionInfo) {
    this.put(RC_INFO_KEYS.RC_EXTENSION_INFO, rcExtensionInfo);
  }

  static getRcExtensionInfo(): RcExtensionInfo {
    return this.get(RC_INFO_KEYS.RC_EXTENSION_INFO);
  }

  static setRcRolePermissions(rcRolePermissions: RcRolePermissions) {
    this.put(RC_INFO_KEYS.RC_ROLE_PERMISSION, rcRolePermissions);
  }

  static getRcRolePermissions(): RcRolePermissions {
    return this.get(RC_INFO_KEYS.RC_ROLE_PERMISSION);
  }

  static setRcPhoneData(rcPhoneData: string) {
    this.put(RC_INFO_KEYS.RC_PHONE_DATA, rcPhoneData);
  }

  static getRcPhoneData(): string {
    return this.get(RC_INFO_KEYS.RC_PHONE_DATA);
  }
}

export { RcInfoConfig };
