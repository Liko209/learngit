/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:44:07
 * Copyright © RingCentral. All rights reserved.
 */
import BaseRequest from '../../BaseRequest';
import NetworkRequestBuilder from '../NetworkRequestBuilder';

class HttpRequest extends BaseRequest {
  constructor(builder: NetworkRequestBuilder) {
    super(
      builder.id,
      builder.path,
      builder.method,
      builder.data,
      builder.headers,
      builder.params,
    );
    this.authFree = builder.authFree;
    this.host = builder.host;
    this.handlerType = builder.handlerType;
    this.requestConfig = builder.requestConfig;
    this.timeout = builder.timeout;
    this.retryCount = builder.retryCount;
    this.priority = builder.priority;
    this.HAPriority = builder.HAPriority;
    this.via = builder.via;
  }
  needAuth(): boolean {
    return !this.authFree;
  }
}

export default HttpRequest;
