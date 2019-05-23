/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:44:15
 * Copyright © RingCentral. All rights reserved.
 */
import BaseResponse from '../../BaseResponse';
import HttpRequest from './HttpRequest';
import HttpResponseBuilder from './HttpResponseBuilder';

class HttpResponse extends BaseResponse<HttpRequest> {
  constructor(builder: HttpResponseBuilder) {
    super(
      builder.data,
      builder.status,
      builder.statusText,
      builder.headers,
      builder.retryAfter,
      builder.request,
    );
  }
}
export default HttpResponse;
