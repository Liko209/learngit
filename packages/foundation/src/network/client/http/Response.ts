/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:44:15
 * Copyright © RingCentral. All rights reserved.
 */
import BaseResponse from '../../BaseResponse';
import NetworkResponseBuilder from './NetworkResponseBuilder';

class Response extends BaseResponse {
  static builder = new NetworkResponseBuilder();
  constructor(builder: NetworkResponseBuilder) {
    super(
      builder.data,
      builder.status,
      builder.statusText,
      builder.headers,
      builder.retryAfter,
      builder.request
    );
  }
}
export default Response;
