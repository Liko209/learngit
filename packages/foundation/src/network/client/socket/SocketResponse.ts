/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:52
 * Copyright © RingCentral. All rights reserved.
 */
import BaseResponse from '../../BaseResponse';
import SocketRequest from './SocketRequest';
import { SocketResponseBuilder } from './SocketResponseBuilder';

class SocketResponse extends BaseResponse<SocketRequest> {
  constructor(builder: SocketResponseBuilder) {
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

export { SocketResponse };
