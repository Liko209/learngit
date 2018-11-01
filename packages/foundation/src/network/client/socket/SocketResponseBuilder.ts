/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:54
 * Copyright © RingCentral. All rights reserved.
 */
import NetworkResponseBuilder from '../NetworkResponseBuilder';
import { SocketResponse } from './SocketResponse';
import _ from 'lodash';

class SocketResponseBuilder extends NetworkResponseBuilder {
  options(options: any) {
    if (options) {
      this.data = options.body || {};
      this.headers = _.pick(options, [
        'Content-Type',
        'X-Frame-Options',
        'X-Request-Id',
      ]);
      this.status = options.request.status_code;
      if (options.request) {
        this.request = {
          ...options.request,
          params: options.request.parameters,
        };
      }
    }
    return this;
  }

  build(): SocketResponse {
    return new SocketResponse(this);
  }
}
export { SocketResponseBuilder };
