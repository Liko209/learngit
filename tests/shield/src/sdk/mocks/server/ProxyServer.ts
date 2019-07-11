/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:18:57
 * Copyright © RingCentral. All rights reserved.
 */
import { IMockServer, IResponseAdapter, IJRequest } from '../../types';
import { ResponseAdapter } from './ResponseAdapter';
import { INetworkRequestExecutorListener, NETWORK_HANDLE_TYPE } from 'foundation/network/network';
import { CommonFileServer } from './CommonFileServer';
import { MockGlipServer } from './glip/MockGlipServer';
import { InstanceManager } from './InstanceManager';
import { SERVER_ALIAS_MAP, IRegexpRequestResponse } from '../../utils/network/networkDataTool';
import _ from 'lodash';
import { createResponse } from './utils';
import { createDebug } from 'sdk/__tests__/utils';

const debug = createDebug('ProxyServer', false);

export class ProxyServer implements IMockServer {
  private _findResponseInRequestResponsePool(request: { host: string; method: string; path: string }) {
    const { host, method, path } = request;
    const pool = this.getRequestResponsePool();
    return pool.find(item => item.host === host && item.request.method === method && (item.path === path || item.pathRegexp.test(path)));
  }
  adapter: IResponseAdapter = new ResponseAdapter();

  getRequestResponsePool(): IRegexpRequestResponse[] {
    return [];
  }

  handle = (request: IJRequest<any>, listener: INetworkRequestExecutorListener) => {
    const transRequestInfo = {
      host: request.host,
      path: request.path,
      method: request.method,
    };
    const match = Object.entries(SERVER_ALIAS_MAP).find(([key, value]) => request.host.startsWith(key));
    if (match) {
      transRequestInfo.host = match[1];
      request.host = match[1];
    }
    debug('handle request: ', transRequestInfo);
    const matchReqRes = this._findResponseInRequestResponsePool(transRequestInfo);
    if (matchReqRes) {
      debug('matchReqRes', matchReqRes);
      if (matchReqRes.response.status < 300 && matchReqRes.response.status > 199) {
        listener.onSuccess(createResponse(matchReqRes.response));
      } else {
        listener.onFailure(createResponse(matchReqRes.response));
      }
      return;
    }
    if ([NETWORK_HANDLE_TYPE.GLIP, NETWORK_HANDLE_TYPE.DEFAULT, NETWORK_HANDLE_TYPE.UPLOAD].includes(request.handlerType.name)) {
      const router = InstanceManager.get(MockGlipServer).getRouter();
      if (router.match(request)) {
        return this.adapter.adapt(router.dispatch)(request, listener);
      }
    }
    InstanceManager.get(CommonFileServer).handle(request, listener);
  };
}
