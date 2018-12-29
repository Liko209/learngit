/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:13:25
 * Copyright © RingCentral. All rights reserved.
 */

class RTCRestApiManager {
  private _httpClient: any = null;

  constructor() {}

  public setClient(Client: any): void {
    this._httpClient = Client;
  }

  public sendRequest(): any {
    if (this._httpClient == null) {
      return null;
    }
  }
}

const rtcRestApiManager: RTCRestApiManager = new RTCRestApiManager();

export { rtcRestApiManager };
