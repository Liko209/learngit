/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:13:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ITelephonyNetworkDelegate } from 'foundation/telephony/ITelephonyNetworkDelegate';
import { IResponse } from 'foundation/network/network';

class RTCRestApiManager {
  private static _singleton: RTCRestApiManager | null = null;
  private _httpClientDelegate: ITelephonyNetworkDelegate = null as any;

  static instance() {
    if (!RTCRestApiManager._singleton) {
      RTCRestApiManager._singleton = new RTCRestApiManager();
    }
    return RTCRestApiManager._singleton;
  }

  static destroy() {
    RTCRestApiManager._singleton = null;
  }

  setNetworkDelegate(delegate: ITelephonyNetworkDelegate): void {
    this._httpClientDelegate = delegate;
  }

  async sendRequest(request: any): Promise<IResponse> {
    if (!this._httpClientDelegate) {
      return null as any;
    }
    return this._httpClientDelegate.doHttpRequest(request);
  }

  reset() {
    this._httpClientDelegate = null as any;
  }

  getClient(): ITelephonyNetworkDelegate {
    return this._httpClientDelegate;
  }
}

export { RTCRestApiManager };
