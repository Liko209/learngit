/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 11:25:33
 * Copyright © RingCentral. All rights reserved.
 */
import { IClient, IRequest, INetworkRequestExecutorListener } from '../network';

abstract class BaseClient implements IClient {
  tasks: Map<string, IRequest>;
  constructor() {
    this.tasks = new Map();
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  request(request: IRequest, listener: INetworkRequestExecutorListener): void {
    this.tasks.set(request.id, request);
  }

  cancelRequest(request: IRequest): void {
    request.cancel && request.cancel();
    this.tasks.delete(request.id);
  }

  isNetworkReachable(): boolean {
    return true;
  }
}
export default BaseClient;
