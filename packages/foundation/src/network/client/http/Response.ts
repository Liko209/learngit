/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:44:15
 * Copyright © RingCentral. All rights reserved.
 */
import BaseResponse from '../../BaseResponse';
import NetworkResponseBuilder from './NetworkResponseBuilder';

class HttpResponseBuilder extends NetworkResponseBuilder {
  build(): Response {
    return new Response(this);
  }
}
class Response extends BaseResponse {
  static get builder() {
    return new HttpResponseBuilder();
  }
  constructor(builder: NetworkResponseBuilder) {
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
export default Response;
