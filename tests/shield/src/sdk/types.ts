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

interface IApiContract<T extends IApi> {
  api: T;
  desc: IRoute<T>;
}

interface IApi<Req = any, Res = any> {
  path: string;
  method: string;
  query?: object;
  request: Pick<IBaseRequest<Req>, 'data'>;
  response: Pick<IBaseResponse<Res>, 'data'>;
}

type QueryParser<T> = {
  [key in keyof T]: (v: string) => T[key];
};

type HttpVerb = 'get' | 'post' | 'put' | 'delete';
type Handler = (
  request: IJRequest,
  queryObject?: object,
) => Promise<IJResponse> | IJResponse;

type VerbHandler = { [key in HttpVerb]: Handler };
interface IApiMap {
  [key: string]: Partial<VerbHandler>;
}

type IRoute<T extends IApi> = {
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
) => // routeParams: object,
void | Promise<void>;
interface IRouter {
  use(method: string, path: string, handler: Handler): this;
  match(option: { method: string; path: string }): Nullable<Handler>;
  dispatch(request: IJRequest): ReturnType<Handler>;
}

interface IMockServer {
  handle: RouterHandler;
}

export {
  IJRequest,
  IJResponse,
  // IRequest,
  // IResponse,
  IBaseRequest,
  IBaseResponse,
  INetworkRequestExecutorListener,
  IRoute,
  IApi,
  IApiMap,
  VerbHandler,
  IApiContract,
  Handler,
  IMockServer,
  RouterHandler,
  QueryParser,
  IRouter,
  IResponseAdapter,
};
