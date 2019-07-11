/*
 * @Author: Paynter Chen
 * @Date: 2019-07-05 10:56:08
 * Copyright © RingCentral. All rights reserved.
 */

import {
  IRequest as IJRequest,
  IResponse as IJResponse,
  IBaseRequest,
  IBaseResponse,
  INetworkRequestExecutorListener,
} from 'foundation/network/network';
import { Nullable } from 'sdk/types';

interface IApiContract<Req = any, Res = any> {
  host: string;
  path: string;
  method: string;
  query?: object;
  request: Partial<Pick<IBaseRequest<Req>, 'data'>>;
  response: Pick<IBaseResponse<Res>, 'data'>;
}

type QueryParser<T> = { [key in keyof T]: (v: string) => T[key] };

type HttpVerb = 'get' | 'post' | 'put' | 'delete';
type Handler = (
  request: IJRequest,
  queryObject?: object,
) => Promise<IJResponse> | IJResponse;

type VerbHandler = { [key in HttpVerb]: Handler };
interface IApiMap {
  [key: string]: Partial<VerbHandler>;
}

type IRoute<T extends IApiContract> = {
  path: string;
  method?: string;
  query?: QueryParser<T['query']>;
};

interface IResponseAdapter {
  adapt: (handler: Handler) => RouterHandler;
}

type RouterHandler = (
  request: IJRequest,
  cb: INetworkRequestExecutorListener,
) => void | Promise<void>;
interface IRouter {
  use(method: string, path: string, handler: Handler): this;
  match(option: { method: string; path: string }): Nullable<Handler>;
  dispatch(request: IJRequest): ReturnType<Handler>;
}

interface IMockServer {
  handle: RouterHandler;
}

type MockResponse = <
  A extends IApiContract<any, any> = IApiContract<any, any>,
  ReqData = A extends IApiContract<infer B, any> ? B : any,
  ResData = A extends IApiContract<any, infer B> ? B : any,
  T extends (api: A) => any = (api: IApiContract<ReqData, ResData>) => any
>(
  requestResponse: IRequestResponse<ReqData, ResData>,
  extractor?: T,
) => ReturnType<T>;

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
  // hostAlias?: string;
}

interface ISocketRequestInfo<T = any> extends ISocketInfo {
  chanel: 'request';
  data: ISocketRequest<T>;
}

interface ISocketResponseInfo<T = any> extends ISocketInfo {
  chanel: 'response';
  data: ISocketResponse<T>;
}

interface IRequestResponse<Req = any, Res = any>
  extends INetworkInfo,
    IApiContract<Req, Res> {
  type: 'request-response';
  via: string;
  // url: string;
  method: string;
  request: IBaseRequest<Req>;
  response: IBaseResponse<Res>;
}

interface IRegexpRequestResponse<Req = any, Res = any>
  extends IRequestResponse {
  pathRegexp: RegExp;
}

interface ISocketInfo<T = any> extends INetworkInfo {
  type: 'socket-message';
  // url: string;
  protocol: string;
  direction: 'send' | 'receive';
  rawData: string;
  chanel?: string;
  data?: T;
}

export {
  IJRequest,
  IJResponse,
  IBaseRequest,
  IBaseResponse,
  INetworkRequestExecutorListener,
  IRoute,
  IApiContract,
  IApiMap,
  VerbHandler,
  Handler,
  IMockServer,
  RouterHandler,
  QueryParser,
  IRouter,
  IResponseAdapter,
  MockResponse,
  ISocketRequest,
  ISocketResponse,
  INetworkInfo,
  ISocketRequestInfo,
  ISocketResponseInfo,
  IRequestResponse,
  IRegexpRequestResponse,
  ISocketInfo,
};
