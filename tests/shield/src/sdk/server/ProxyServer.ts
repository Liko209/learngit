/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:18:57
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IMockServer,
  IResponseAdapter,
  IJRequest,
  IMockRequestResponse,
} from 'shield/sdk/types';
import { ResponseAdapter } from './ResponseAdapter';
import {
  INetworkRequestExecutorListener,
  NETWORK_HANDLE_TYPE,
} from 'foundation/network/network';
import { CommonFileServer } from './CommonFileServer';
import { MockGlipServer } from 'shield/sdk/mocks/glip/MockGlipServer';
import { InstanceManager } from './InstanceManager';
import { SERVER_ALIAS_MAP } from 'shield/sdk/utils/network/networkDataTool';
import _ from 'lodash';
import { createResponse } from 'shield/sdk/utils';
import { createDebug } from 'sdk/__tests__/utils';

const debug = createDebug('ProxyServer');

export class ProxyServer implements IMockServer {
  private _findResponseInRequestResponsePool(request: {
    host: string;
    method: string;
    path: string;
  }) {
    const { host, method, path } = request;
    const pool = this.getRequestResponsePool();
    return _.findLast(
      pool,
      item =>
        item.host === host &&
        item.request.method.toLowerCase() === method.toLowerCase() &&
        (item.path === path || item.pathRegexp.test(path)),
    );
  }
  adapter: IResponseAdapter = new ResponseAdapter();

  getRequestResponsePool(): IMockRequestResponse[] {
    return [];
  }

  handleRequest = (
    request: IJRequest<any>,
    listener: INetworkRequestExecutorListener,
  ) => {
    request.host = request.host.replace(/https:\/\//, '');
    const transRequestInfo = {
      host: request.host,
      path: request.path,
      method: request.method,
    };
    const match = Object.entries(SERVER_ALIAS_MAP).find(([key, value]) =>
      request.host.startsWith(key),
    );
    if (match) {
      transRequestInfo.host = match[1];
      request.host = match[1];
    }
    debug('handle request: ', transRequestInfo);
    const matchReqRes = this._findResponseInRequestResponsePool(
      transRequestInfo,
    );
    if (matchReqRes) {
      const response = matchReqRes.mapper
        ? matchReqRes.mapper(request, matchReqRes)
        : createResponse(matchReqRes.response);
      debug('matchReqRes request:', {
        request: _.pick(request, ['data', 'params']),
        matchReqRes,
        response: _.pick(response, 'data'),
      });
      if (
        matchReqRes.response.status < 300 &&
        matchReqRes.response.status > 199
      ) {
        listener.onSuccess(response);
      } else {
        listener.onFailure(response);
      }
      return;
    }
    if (
      [
        NETWORK_HANDLE_TYPE.GLIP,
        NETWORK_HANDLE_TYPE.DEFAULT,
        NETWORK_HANDLE_TYPE.UPLOAD,
      ].includes(request.handlerType.name)
    ) {
      return InstanceManager.get(MockGlipServer).handleRequest(
        request,
        listener,
      );
    }
    InstanceManager.get(CommonFileServer).handleRequest(request, listener);
  };
}
