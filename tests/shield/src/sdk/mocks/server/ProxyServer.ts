import { IMockServer, RouterHandler } from './types';
import {
  IRequest,
  INetworkRequestExecutorListener,
  IResponse,
  NETWORK_HANDLE_TYPE,
} from 'foundation/network/network';
import { CommonFileServer } from './CommonFileServer';
import { MockGlipServer } from './glip/MockGlipServer';
import { InstanceManager } from './InstanceManager';
import {
  IRequestResponse,
  SERVER_ALIAS_MAP,
} from 'src/sdk/utils/network/networkDataTool';
import _ from 'lodash';
import { createResponse } from './utils';

export class ProxyServer implements IMockServer {
  private _findResponseInRequestResponsePool(request: {
    host: string;
    hostAlias?: string;
    method: string;
    path: string;
  }) {
    const { host, hostAlias, method, path } = request;
    const pool = this.getRequestResponsePool();
    console.warn('pool: ', pool);
    return pool.find(item => {
      return (
        (item.host === host || (hostAlias && item.hostAlias === hostAlias)) &&
        item.path === path &&
        item.request.method === method
      );
    });
  }

  getRequestResponsePool(): IRequestResponse[] {
    return [];
  }

  handle = (
    request: IRequest<any>,
    listener: INetworkRequestExecutorListener,
  ) => {
    const transRequestInfo = {
      host: request.host,
      hostAlias: '',
      method: request.method,
      path: request.path,
    };
    const match = Object.entries(SERVER_ALIAS_MAP).find(([key, value]) =>
      request.host.startsWith(key),
    );
    if (match) {
      transRequestInfo.hostAlias = match[1];
    }
    const matchReqRes = this._findResponseInRequestResponsePool(
      transRequestInfo,
    );
    if (matchReqRes) {
      console.log('TCL: matchReqRes', matchReqRes);
      if (
        matchReqRes.response.status < 300 &&
        matchReqRes.response.status > 199
      ) {
        listener.onSuccess(createResponse(matchReqRes.response));
      } else {
        listener.onFailure(createResponse(matchReqRes.response));
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
      InstanceManager.get(MockGlipServer).handle(request, listener);
    } else {
      InstanceManager.get(CommonFileServer).handle(request, listener);
    }
  }
}
