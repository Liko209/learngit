/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:44:07
 * Copyright © RingCentral. All rights reserved.
 */
import BaseRequest from '../../BaseRequest';
import NetworkRequestBuilder from '../NetworkRequestBuilder';

class HttpRequest extends BaseRequest {
  constructor(builder: NetworkRequestBuilder) {
    super(builder);
  }
  needAuth(): boolean {
    return !this.authFree;
  }
}

export default HttpRequest;
