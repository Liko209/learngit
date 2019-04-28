/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 11:25:33
 * Copyright © RingCentral. All rights reserved.
 */
import { IClient, IRequest, INetworkRequestExecutorListener } from '../..';

abstract class BaseClient implements IClient {
  tasks: Map<string, IRequest>;
  constructor() {
    this.tasks = new Map();
  }

  request(request: IRequest, listener: INetworkRequestExecutorListener): void {
    this.tasks.set(request.id, request);
  }

  cancelRequest(request: IRequest): void {
    this.tasks.delete(request.id);
  }

  isNetworkReachable(): boolean {
    if (typeof navigator === 'undefined') {
      return true;
    }
    return navigator.onLine;
  }
}
export default BaseClient;
