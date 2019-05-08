/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:34
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IRequest,
  REQUEST_WEIGHT,
  REQUEST_PRIORITY,
  NETWORK_VIA,
} from './network';

class RequestTask {
  request: IRequest;
  weight: REQUEST_WEIGHT;
  constructor(request: IRequest) {
    const REQUEST_PRIORITY_WEIGHT = {
      [REQUEST_PRIORITY.NORMAL]: REQUEST_WEIGHT.NORMAL,
      [REQUEST_PRIORITY.HIGH]: REQUEST_WEIGHT.HIGH,
      [REQUEST_PRIORITY.SPECIFIC]: REQUEST_WEIGHT.HIGH,
    };
    this.request = request;
    this.weight = REQUEST_PRIORITY_WEIGHT[this.request.priority];
  }

  priority() {
    return this.request.priority;
  }

  setRequestPriority(priority: REQUEST_PRIORITY) {
    this.request.priority = priority;

    switch (priority) {
      case REQUEST_PRIORITY.NORMAL:
        if (this.weight < REQUEST_WEIGHT.NORMAL) {
          this.weight = REQUEST_WEIGHT.NORMAL;
        }
        break;
      case REQUEST_PRIORITY.HIGH:
        if (this.weight < REQUEST_WEIGHT.HIGH) {
          this.weight = REQUEST_WEIGHT.HIGH;
        }
        break;
      case REQUEST_PRIORITY.SPECIFIC:
        if (this.weight < REQUEST_WEIGHT.HIGH) {
          this.weight = REQUEST_WEIGHT.HIGH;
        }
        break;
      default:
        this.weight = 0;
    }
  }

  via(): NETWORK_VIA {
    return this.request.via;
  }

  setVia(via: NETWORK_VIA) {
    this.request.via = via;
  }

  incrementTaskWeight() {
    this.weight = this.weight + 1;
  }
}
export default RequestTask;
