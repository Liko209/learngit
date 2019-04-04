/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:48
 * Copyright © RingCentral. All rights reserved.
 */
import BaseRequest from '../../BaseRequest';
import NetworkRequestBuilder from '../NetworkRequestBuilder';

class SocketRequest extends BaseRequest {
  parameters: object = {};
  uri: string = '';
  constructor(builder: NetworkRequestBuilder) {
    super(builder);
    this.parameters = {
      ...builder.params,
      ...builder.data,
      request_id: builder.id,
    };
    this.uri = builder.path;
    delete this.params;
  }
  needAuth(): boolean {
    return !this.authFree;
  }
}
type SocketRequestParamsType = { request_id: string };
export default SocketRequest;
export { SocketRequestParamsType };
