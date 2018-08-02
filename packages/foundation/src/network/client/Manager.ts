/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 15:19:18
 * Copyright © RingCentral. All rights reserved.
 */

import { Http } from './http';
import { Socket } from './socket';
import { NETWORK_VIA } from '../network';
class Manager {
  httpClient: Http;
  socketClient: Socket;
  constructor() {
    this.httpClient = new Http();
    this.socketClient = new Socket();
  }

  getApiClient(via: NETWORK_VIA) {
    let client = this.httpClient;
    switch (via) {
      case NETWORK_VIA.HTTP:
        client = this.httpClient;
        break;
      case NETWORK_VIA.SOCKET:
        client = this.socketClient;
        break;
      default:
        break;
    }

    return client;
  }

  getAvailableClientType(): NETWORK_VIA {
    if (this.socketClient.isNetworkReachable()) {
      return NETWORK_VIA.SOCKET;
    }
    return NETWORK_VIA.HTTP;
  }
}
export default Manager;
