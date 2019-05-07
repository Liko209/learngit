/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-03 11:25:27
 * Copyright © RingCentral. All rights reserved.
 */
import axios, { AxiosError } from 'axios';

import {
  INetworkRequestExecutorListener,
  IRequest,
  NETWORK_FAIL_TEXT,
  RESPONSE_STATUS_CODE,
} from '../../network';
import BaseClient from '../BaseClient';
import HttpResponseBuilder from './HttpResponseBuilder';
import { RESPONSE_HEADER_KEY } from '../../Constants';
import { networkLogger } from '../../../log';

function isAxiosError<T extends AxiosError>(error: Error): error is T {
  return !!error['config'];
}

function parseNoResponseErrorStatus(code: string | undefined, message: string) {
  let status = RESPONSE_STATUS_CODE.DEFAULT;
  if (code === 'ECONNABORTED') {
    if (message === 'Request aborted') {
      status = RESPONSE_STATUS_CODE.LOCAL_ABORTED;
    } else if (message.startsWith('timeout')) {
      status = RESPONSE_STATUS_CODE.LOCAL_TIME_OUT;
    }
  } else if (code === null) {
    if (message === 'Network Error') {
      status = RESPONSE_STATUS_CODE.NETWORK_ERROR;
    }
  }
  return status;
}

class Http extends BaseClient {
  request(request: IRequest, listener: INetworkRequestExecutorListener): void {
    super.request(request, listener);
    const {
      method,
      headers,
      host,
      path,
      timeout,
      requestConfig = {},
    } = request;
    const source = axios.CancelToken.source();
    request.cancel = source.cancel;
    const options = {
      method,
      headers,
      timeout,
      baseURL: host,
      url: path,
      withCredentials: false,
      data: {},
      params: {},
      cancelToken: source.token,
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
        this.tasks.delete(request.id);
        const { data, status, statusText } = res;
        const response = HttpResponseBuilder.builder
          .setData(data)
          .setStatus(status)
          .setStatusText(statusText)
          .setRequest(request)
          .setHeaders(res.headers)
          .build();
        listener.onSuccess(response);
      })
      .catch(err => {
        networkLogger.log('Http request failed');
        this.tasks.delete(request.id);
        let data: any;
        let status: number = RESPONSE_STATUS_CODE.DEFAULT;
        let statusText: string = '';
        let responseHeaders: any;
        let retryAfter = 0;
        if (isAxiosError(err)) {
          const { response, message, code } = err;
          networkLogger.info('axios error: ', { message, code });
          if (response) {
            // parse server error info
            status = response.status;
            statusText = response.statusText || message;
            networkLogger.info('server error: ', { status, statusText });
            responseHeaders = response.headers;
            data = response['data'];
            if (
              response['headers'] &&
              response['headers'].hasOwnProperty(
                RESPONSE_HEADER_KEY.RETRY_AFTER,
              )
            ) {
              retryAfter = response['headers'][RESPONSE_HEADER_KEY.RETRY_AFTER];
            }
          } else {
            networkLogger.info('local error, code: ', code);
            status = parseNoResponseErrorStatus(code, message);
            statusText = message;
          }
        } else if (err instanceof axios.Cancel) {
          networkLogger.info('Http request canceled!');
          status = RESPONSE_STATUS_CODE.LOCAL_CANCELLED;
          statusText = NETWORK_FAIL_TEXT.CANCELLED;
        }
        const res = HttpResponseBuilder.builder
          .setData(data)
          .setStatus(status)
          .setStatusText(statusText)
          .setHeaders(responseHeaders)
          .setRequest(request)
          .setRetryAfter(retryAfter)
          .build();
        listener.onFailure(res);
      });
  }
}
export default Http;
