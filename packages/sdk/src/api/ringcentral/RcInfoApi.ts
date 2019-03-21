/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 16:27:42
 * Copyright © RingCentral. All rights reserved.
 */

import Api from '../api';
import { RINGCENTRAL_API } from './constants';
import { NETWORK_METHOD, NETWORK_VIA, HA_PRIORITY } from 'foundation';
import { RcClientInfo } from './types/RcClientInfo';
import { RcAccountInfo } from './types/RcAccountInfo';
import { RcExtensionInfo } from './types/RcExtensionInfo';
import { RcRolePermissions } from './types/RcRolePermissions';
import { RcAPIVersion } from './types/common';

class RcInfoApi extends Api {
  static requestRcAPIVersion() {
    const query = {
      path: RINGCENTRAL_API.API_VERSION,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
    };
    return RcInfoApi.rcNetworkClient.http<RcAPIVersion>(query);
  }

  static requestRcClientInfo() {
    const query = {
      path: RINGCENTRAL_API.API_CLIENT_INFO,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RcInfoApi.rcNetworkClient.http<RcClientInfo>(query);
  }

  static requestRcAccountInfo() {
    const query = {
      path: RINGCENTRAL_API.API_ACCOUNT_INFO,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RcInfoApi.rcNetworkClient.http<RcAccountInfo>(query);
  }

  static requestRcExtensionInfo() {
    const query = {
      path: RINGCENTRAL_API.API_EXTENSION_INFO,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RcInfoApi.rcNetworkClient.http<RcExtensionInfo>(query);
  }

  static requestRcRolePermission() {
    const query = {
      path: RINGCENTRAL_API.API_ROLE_PERMISSION,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RcInfoApi.rcNetworkClient.http<RcRolePermissions>(query);
  }
}

export { RcInfoApi };
