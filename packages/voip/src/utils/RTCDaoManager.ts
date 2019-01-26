/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2019-01-26 15:19:22
 * Copyright © RingCentral. All rights reserved.
 */

import { ITelephonyDaoDelegate } from 'foundation';
import { RTCSipProvisionInfo } from '../account/types';
import { rtcLogger } from './RTCLoggerProxy';

const LOG_TAG = 'RTCDaoMananger';

class RTCDaoManager {
  private _delegate: ITelephonyDaoDelegate | null = null;

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
    this._delegate.put('sip-info', provisionInfo);
  }

  public readProvisioning(): RTCSipProvisionInfo | null {
    if (!this._delegate) {
      rtcLogger.warn(
        LOG_TAG,
        'Failed to read provisioning info. DAO delegate is null',
      );
      return null;
    }
    return this._delegate.get('sip-info');
  }
}

const rtcDaoManager = new RTCDaoManager();

export { rtcDaoManager };
