/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 11:25:27
 * Copyright © RingCentral. All rights reserved.
 */

import axios from 'axios';

import BaseClient from '../BaseClient';
import Response from './Response';
import {
  IRequest,
  INetworkRequestExecutorListener,
  NETWORK_FAIL_TYPE
} from '../../..';
class Http extends BaseClient {
  request(request: IRequest, listener: INetworkRequestExecutorListener): void {
    super.request(request, listener);
    this.tasks[request.id] = request;
    const { CancelToken } = axios;
    const {
      method,
      headers,
      host,
      path,
      timeout,
      requestConfig = {}
    } = request;

    const options = {
      baseURL: host,
      url: path,
      method,
      headers,
      timeout,
      data: {},
      params: {},
      cancelToken: new CancelToken(cancel => {
        this.tasks[request.id].cancel = cancel;
      })
    };
    if (request.data) {
      options.data = request.data;
    }
    if (request.params) {
      options.params = request.params;
    }

    if (Object.keys(requestConfig).length) {
      Object.assign(options, requestConfig);
    }

    axios(options)
      .then(res => {
        delete this.tasks[request.id];
        const { data, status, statusText } = res;
        const response = Response.builder
          .setData(data)
          .setStatus(status)
          .setStatusText(statusText)
          .setRequest(request)
          .setHeaders(res.headers)
          .build();
        listener.onSuccess(request.id, response);
      })
      .catch(err => {
        delete this.tasks[request.id];
        const { response = {}, code, message } = err;
        const { data } = response;
        let { status, statusText } = response;
        if (code === NETWORK_FAIL_TYPE.TIME_OUT) {
          status = 0;
          statusText = NETWORK_FAIL_TYPE.TIME_OUT;
        }
        if (code === NETWORK_FAIL_TYPE.CANCELLED) {
          status = 0;
          statusText = NETWORK_FAIL_TYPE.CANCELLED;
        }
        const res = Response.builder
          .setData(data)
          .setStatus(status)
          .setStatusText(statusText || message)
          .setHeaders(response.headers)
          .setRequest(request)
          .build();
        listener.onFailure(request.id, res);
      });
  }
}
export default Http;
