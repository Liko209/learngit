/*
 * help us to collect glip server api request/response via xhr/socket
 * json save by this tool can be use to mock server response in IT directly.
 * @Author: Paynter Chen
 * @Date: 2019-06-30 18:23:33
 * Copyright © RingCentral. All rights reserved.
 */
import { IBaseRequest, IBaseResponse } from '../../types';
const INJECT_FLAG = '__jupiter__';
const INJECT_DATA = '__jupiter_data__';
const INJECT_HEADER = '__jupiter_header__';
const GLIP_SOCKET_CHANEL_PATTERN = /^\d+\[\"([^"]*)\",(.*)\]$/;
// [fullMatch, hostName, path]
const URL_HOST_PATH = /^((?:https|http|wss|ws)?\:\/\/(?:[^\/:?#]+))(?:\:\d*)?(\/*[^?#]*[^?#\/])/;
export const SERVER_ALIAS_MAP = {
  // GLP-DEV-XMN
  'https://api-glpdevxmn.lab.nordigy.ru': 'rc',
  'https://glpdevxmn.asialab.glip.net': 'glip',
  // xmnup
  'https://api-xmnup.lab.nordigy.ru': 'rc',
  'https://xmnup.asialab.glip.net': 'glip',
  // chris sandbox
  'https://aws13-g04-uds02.asialab.glip.net': 'glip',
  // production
  'https://platform.ringcentral.com': 'rc',
  'https://app.glip.com': 'glip',
};

interface ISocketRequest<T = object> {
  id: string;
  path: string;
  method: string;
  headers: object;
  host: string;
  timeout: number;
  authFree: boolean;
  parameters: T;
  uri: string;
}

interface ISocketResponse<T = any> {
  request: {
    status_code: number;
    status_text: string;
    parameters: {
      request_id: string;
    };
  };
  body: T;
}

interface INetworkInfo {
  type: 'request-response' | 'socket-message';
  // url: string;
  host: string;
  path: string;
  hostAlias?: string;
}

export interface IRequestResponse<Req = any, Res = any> extends INetworkInfo {
  type: 'request-response';
  via: string;
  // url: string;
  method: string;
  request: IBaseRequest<Req>;
  response: IBaseResponse<Res>;
}

export interface ISocketInfo<T = any> extends INetworkInfo {
  type: 'socket-message';
  // url: string;
  protocol: string;
  direction: 'send' | 'receive';
  rawData: string;
  chanel?: string;
  data?: T;
}

interface ISocketRequestInfo<T = any> extends ISocketInfo {
  chanel: 'request';
  data: ISocketRequest<T>;
}

interface ISocketResponseInfo<T = any> extends ISocketInfo {
  chanel: 'response';
  data: ISocketResponse<T>;
}

class Utils {
  static parseHostPath(url: string) {
    const match = url.match(URL_HOST_PATH);
    if (match) {
      const [, host, path] = match;
      return {
        host,
        path,
      };
    }
    return {
      host: url,
      path: '',
    };
  }

  static parseHeaders(headers: string) {
    const parsed = {};
    let key;
    let val;
    let i;

    if (!headers) {
      return parsed;
    }

    headers.split('\n').forEach(line => {
      i = line.indexOf(':');
      key = line
        .substr(0, i)
        .trim()
        .toLowerCase();
      val = line.substr(i + 1).trim();

      if (key) {
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? `${parsed[key]},  ${val}` : val;
        }
      }
    });

    return parsed;
  }

  static fromSocketRequest(request: ISocketRequest): IBaseRequest {
    return {
      // url: `${request.host}${request.uri}`,
      host: request.host,
      path: request.uri,
      method: request.method,
      headers: request.headers,
      data: request.parameters,
      // withCredentials: !request.authFree,
    };
  }

  static fromSocketResponse(response: ISocketResponse): IBaseResponse {
    const header = { ...response };
    delete header.request;
    delete header.body;
    return {
      headers: header,
      status: response.request.status_code,
      statusText: response.request.status_text,
      data: Utils.toJson(response.body),
    };
  }

  static isString(obj: any) {
    return Object.prototype.toString.call(obj) === '[object String]';
  }

  static toJson(data: any): any {
    if (Utils.isString(data)) {
      try {
        return Utils.toJson(JSON.parse(data));
      } catch {
        return data;
      }
    }
    return data;
  }

  static saveBlob(name: string, blob: Blob) {
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  static parseGlip(info: ISocketInfo) {
    if (GLIP_SOCKET_CHANEL_PATTERN.test(info.rawData)) {
      const [, chanel, data] = GLIP_SOCKET_CHANEL_PATTERN.exec(info.rawData)!;
      info.chanel = chanel;
      info.data = Utils.toJson(data);
    }
    return info;
  }
}

let onXhrInfoComing: (info: IRequestResponse) => void;
let onSocketInfoComing: (info: ISocketInfo) => void;
function subscribeXHR(callback: (info: IRequestResponse) => void) {
  onXhrInfoComing = callback;
  if (!XMLHttpRequest.prototype[INJECT_FLAG]) {
    const originOpen = XMLHttpRequest.prototype.open;
    const originSend = XMLHttpRequest.prototype.send;
    const originSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype[INJECT_FLAG] = true;
    XMLHttpRequest.prototype.setRequestHeader = function (
      name: string,
      value: string,
    ) {
      // tslint:disable-next-line:no-this-assignment
      const request = this;
      request[INJECT_HEADER] = request[INJECT_HEADER] || {};
      request[INJECT_HEADER][name] = value;
      originSetRequestHeader.apply(this, arguments);
    };
    XMLHttpRequest.prototype.open = function () {
      const method = arguments[0];
      const openUrl = arguments[1];
      // tslint:disable-next-line:no-this-assignment
      const request = this;
      request[INJECT_FLAG] = true;
      const readyStateChangeListener = () => {
        request[INJECT_FLAG] = false;
        if (request.readyState === 4) {
          request.removeEventListener(
            'readystatechange',
            readyStateChangeListener,
          );
          const { host, path } = Utils.parseHostPath(openUrl);
          const responseHeader =
            request.getAllResponseHeaders && request.getAllResponseHeaders();
          onXhrInfoComing &&
            onXhrInfoComing({
              host,
              path,
              method,
              // url: openUrl,
              type: 'request-response',
              via: 'xhr',
              request: {
                host,
                path,
                method,
                // url: openUrl,
                // ...Utils.parseHostPatch(openUrl),
                // withCredentials: request.withCredentials,
                data: request[INJECT_DATA],
                headers: request[INJECT_HEADER],
              },
              response: {
                status: request.status,
                statusText: request.statusText,
                // responseType: request.responseType,
                data: ['', 'text'].includes(request.responseType)
                  ? Utils.toJson(request.responseText)
                  : request.responseType,
                headers: Utils.parseHeaders(responseHeader),
              },
            });
        }
      };
      this.addEventListener('readystatechange', readyStateChangeListener);
      return originOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (data) {
      // tslint:disable-next-line:no-this-assignment
      const request = this;
      if (request[INJECT_FLAG]) {
        request[INJECT_DATA] = data;
      }
      return originSend.apply(this, arguments);
    };
  }
}

function subscribeSocket(callback: (info: ISocketInfo) => void) {
  onSocketInfoComing = callback;
  const originSocketSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function () {
    // tslint:disable-next-line:no-this-assignment
    const socket = this;
    onSocketInfoComing &&
      onSocketInfoComing({
        type: 'socket-message',
        // url: socket.url,
        ...Utils.parseHostPath(socket.url),
        protocol: socket.protocol,
        direction: 'send',
        rawData: arguments[0],
      });
    if (!socket[INJECT_FLAG]) {
      socket[INJECT_FLAG] = true;
      const messageListener = function (event: MessageEvent) {
        onSocketInfoComing &&
          onSocketInfoComing({
            type: 'socket-message',
            // url: socket.url,
            ...Utils.parseHostPath(socket.url),
            protocol: socket.protocol,
            direction: 'receive',
            rawData: event.data,
          });
      };
      const closeListener = () => {
        socket[INJECT_FLAG] = false;
        socket.removeEventListener('message', messageListener);
        socket.removeEventListener('close', closeListener);
      };
      socket.addEventListener('message', messageListener);
      socket.addEventListener('close', closeListener);
    }
    return originSocketSend.apply(this, arguments);
  };
  return () => {};
}

class NetworkDataTool {
  private _infoPool: (ISocketInfo | IRequestResponse)[] = [];

  private _aliasHost(host: string) {
    const match = Object.entries(SERVER_ALIAS_MAP).find(([key, value]) =>
      host.startsWith(key),
    );
    return match ? match[1] : undefined;
  }

  startWatch() {
    subscribeXHR(xhrInfo => {
      xhrInfo.hostAlias = this._aliasHost(xhrInfo.host);
      this._infoPool.push(xhrInfo);
    });
    subscribeSocket(socketInfo => {
      const parseResult = Utils.parseGlip(socketInfo);
      socketInfo.hostAlias = this._aliasHost(socketInfo.host);
      this._infoPool.push(parseResult);
      switch (socketInfo.chanel) {
        case 'response':
          const socketResponse = socketInfo as ISocketResponseInfo;
          const {
            request: {
              parameters: { request_id },
            },
          } = socketResponse.data;
          const sourceRequest = this._infoPool.find(
            item =>
              item.type === 'socket-message' &&
              item['chanel'] === 'request' &&
              (item as ISocketRequestInfo).data.id.toString() === request_id,
          ) as ISocketInfo;
          if (sourceRequest) {
            const rawRequest = Utils.fromSocketRequest(sourceRequest.data);
            // const { host, path } = Utils.parseHostPath(rawRequest.url);
            this._infoPool.push({
              host: rawRequest.host,
              path: rawRequest.path,
              method: rawRequest.method,
              type: 'request-response',
              via: 'socket',
              // url: rawRequest.url,
              hostAlias: this._aliasHost(rawRequest.host),
              request: rawRequest,
              response: Utils.fromSocketResponse(socketResponse.data),
            });
          }
          break;

        default:
          break;
      }
    });
  }

  clear() {
    this._infoPool.splice(0);
    return this;
  }

  filter(_filter: (info: ISocketInfo | IRequestResponse) => boolean) {
    this._infoPool = this._infoPool.filter(_filter);
    return this;
  }

  save() {
    Utils.saveBlob(
      'network_all.json',
      new Blob([
        JSON.stringify(
          this._infoPool.filter(item => !!item.hostAlias),
          null,
          2,
        ),
      ]),
    );
  }

  saveSocketOnly() {
    Utils.saveBlob(
      'network_socket_only.json',
      new Blob([
        JSON.stringify(
          this._infoPool.filter(
            item => item.hostAlias && item.type === 'socket-message',
          ),
          null,
          2,
        ),
      ]),
    );
  }

  saveRequestResponseOnly() {
    Utils.saveBlob(
      'network_request_response_only.json',
      new Blob([
        JSON.stringify(
          this._infoPool.filter(
            item => item.hostAlias && item.type === 'request-response',
          ),
          null,
          2,
        ),
      ]),
    );
  }
}

const _networkDataTool = new NetworkDataTool();
_networkDataTool.startWatch();

window['_networkDataTool'] = _networkDataTool;
