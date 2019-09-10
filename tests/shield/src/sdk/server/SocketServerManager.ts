/*
 * @Author: Paynter Chen
 * @Date: 2019-07-11 22:33:26
 * Copyright © RingCentral. All rights reserved.
 */
import { MockSocketServer } from './MockSocketServer';

export class SocketServerManager {
  private static _socketServerMap: Map<string, MockSocketServer> = new Map();

  public static get(url: string): MockSocketServer {
    if (!url.startsWith('https://')) {
      url = `https://${url}`;
    }
    if (!SocketServerManager._socketServerMap.has(url)) {
      SocketServerManager._socketServerMap.set(url, new MockSocketServer(url));
    }
    return SocketServerManager._socketServerMap.get(url)!;
  }
}
