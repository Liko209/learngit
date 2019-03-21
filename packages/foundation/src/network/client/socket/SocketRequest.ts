/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:48
 * Copyright © RingCentral. All rights reserved.
 */
import { NETWORK_VIA } from '../../network';
import { HttpRequest } from '../http';
import NetworkRequestBuilder from '../NetworkRequestBuilder';

class SocketRequest extends HttpRequest {
  parameters: object = {};
  uri: string = '';
  params: SocketRequestParamsType;
  constructor(builder: NetworkRequestBuilder) {
    super(builder);
    this.params = {
      ...builder.params,
      ...builder.data,
      request_id: builder.id,
    };
    this.uri = builder.path;
    this.via = NETWORK_VIA.SOCKET;
  }

  setParams(params: SocketRequestParamsType) {
    this.params = params;
  }
  // setId(id: string) {
  //   this.id = id;
  // }
}
type SocketRequestParamsType = { request_id: string };
export default SocketRequest;
export { SocketRequestParamsType };
