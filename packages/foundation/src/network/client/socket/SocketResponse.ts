/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:52
 * Copyright © RingCentral. All rights reserved.
 */
import { SocketManager } from './SocketManager';
import { SocketRequestParamsType } from './SocketRequest';
// import { SocketResponseBuilder } from './SocketResponseBuilder';
import Response from '../http/Response';

class SocketResponse extends Response {
  // constructor(builder: SocketResponseBuilder) {
  //   super(
  //     builder.data,
  //     builder.status,
  //     builder.statusText,
  //     builder.headers,
  //     builder.retryAfter,
  //     builder.request
  //   );
  // }
  response = () => {
    console.log('--------------- socket response');

    if (this.request && this.request.params) {
      const requestId = (this.request.params as SocketRequestParamsType)
        .request_id;
      SocketManager.emit(requestId, this);
    }
  }
}

export default SocketResponse;
