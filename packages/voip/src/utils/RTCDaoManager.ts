/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-01-26 15:19:22
 * Copyright © RingCentral. All rights reserved.
 */

import { ITelephonyDaoDelegate } from 'foundation';
import { RTCSipProvisionInfo } from '../api/types';
import { rtcLogger } from './RTCLoggerProxy';
import { kProvisioningInfoKey } from './constants';

const LOG_TAG = 'RTCDaoMananger';

class RTCDaoManager {
  private static _singleton: RTCDaoManager | null = null;
  private _delegate: ITelephonyDaoDelegate | null = null;

  public static instance(): RTCDaoManager {
    if (!RTCDaoManager._singleton) {
      return (RTCDaoManager._singleton = new RTCDaoManager());
    }
    return RTCDaoManager._singleton;
  }

  public static destroy() {
    RTCDaoManager._singleton = null;
  }

  public setDaoDelegate(delegate: ITelephonyDaoDelegate) {
    this._delegate = delegate;
  }

  public saveProvisionInfo(provisionInfo: RTCSipProvisionInfo) {
    if (!this._delegate) {
      rtcLogger.warn(
        LOG_TAG,
        'Failed to save provisioning info. DAO delegate is null',
      );
      return;
    }
    this._delegate.put(kProvisioningInfoKey, provisionInfo);
  }

  public readProvisioning(): RTCSipProvisionInfo | null {
    if (!this._delegate) {
      rtcLogger.warn(
        LOG_TAG,
        'Failed to read provisioning info. DAO delegate is null',
      );
      return null;
    }
    return this._delegate.get(kProvisioningInfoKey);
  }

  public removeProvisioning() {
    if (!this._delegate) {
      rtcLogger.warn(
        LOG_TAG,
        'Failed to remove provisioning info. DAO delegate is null',
      );
      return;
    }
    rtcLogger.debug(LOG_TAG, 'remove provisioning info in DAO');
    this._delegate.remove(kProvisioningInfoKey);
  }
}

export { RTCDaoManager };
