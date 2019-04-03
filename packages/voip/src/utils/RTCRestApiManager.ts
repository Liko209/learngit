/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:13:25
 * Copyright © RingCentral. All rights reserved.
 */

import { ITelephonyNetworkDelegate } from 'foundation/src/telephony/ITelephonyNetworkDelegate';
import { IResponse } from 'foundation/src/network/network';

class RTCRestApiManager {
  private static _singleton: RTCRestApiManager | null = null;
  private _httpClientDelegate: ITelephonyNetworkDelegate = null as any;

  public static instance() {
    if (!RTCRestApiManager._singleton) {
      RTCRestApiManager._singleton = new RTCRestApiManager();
    }
    return RTCRestApiManager._singleton;
  }

  public static destroy() {
    RTCRestApiManager._singleton = null;
  }

  public setNetworkDelegate(delegate: ITelephonyNetworkDelegate): void {
    this._httpClientDelegate = delegate;
  }

  async sendRequest(request: any): Promise<IResponse> {
    if (!this._httpClientDelegate) {
      return null as any;
    }
    return this._httpClientDelegate.doHttpRequest(request);
  }

  public reset() {
    this._httpClientDelegate = null as any;
  }

  public getClient(): ITelephonyNetworkDelegate {
    return this._httpClientDelegate;
  }
}

export { RTCRestApiManager };
