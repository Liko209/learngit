/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:59
 * Copyright © RingCentral. All rights reserved.
 */
import {
  INetworkRequestExecutor,
  IRequestDecoration,
  IRequest,
} from './network';

class NetworkRequestDecorator implements INetworkRequestExecutor {
  private executor: INetworkRequestExecutor;
  private _decoration: IRequestDecoration;

  constructor(decoration: IRequestDecoration) {
    this._decoration = decoration;
  }

  get decoration() {
    return this._decoration;
  }

  setExecutor(executor: INetworkRequestExecutor): INetworkRequestExecutor {
    this.executor = executor;
    return this;
  }

  cancel() {
    this.executor.cancel();
  }

  isPause() {
    return this.executor.isPause();
  }

  getRequest(): IRequest {
    return this.executor.getRequest();
  }

  execute() {
    if (this.executor) {
      this.decoration.decorate(this.getRequest());
      this.executor.execute();
    }
  }
}

export default NetworkRequestDecorator;
