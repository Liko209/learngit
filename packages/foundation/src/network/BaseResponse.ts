/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-15 15:34:20
 * Copyright © RingCentral. All rights reserved.
 */

import { IResponse, RESPONSE_STATUS_CODE, IRequest } from '../network';
abstract class BaseResponse<R extends IRequest = IRequest>
  implements IResponse {
  request: R;
  constructor(
    readonly data: any,
    readonly status: RESPONSE_STATUS_CODE,
    readonly statusText: string,
    readonly headers: object,
    readonly retryAfter: number,
    request: R,
  ) {
    this.data = data;
    this.status = status;
    this.statusText = statusText;
    this.headers = headers;
    this.retryAfter = retryAfter;
    this.request = request;
  }
}

export default BaseResponse;
