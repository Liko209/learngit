/*
 * @Author: Paynter Chen
 * @Date: 2019-07-05 10:56:08
 * Copyright © RingCentral. All rights reserved.
 */

import {
  IRequest,
  INetworkRequestExecutorListener,
  IResponse,
} from 'foundation/network/network';
import { UndefinedAble, Nullable } from 'sdk/types';
// interface IRequest {}
// interface IResponse {}
interface IApiContract<T extends IApi> {
  api: T;
  desc: IRoute<T>;
}

interface IApi {
  path: string;
  method: string;
  query: object;
  request: object;
  response: object;
}

// interface IRouterHandler<T extends IApi> {
//   (param: T): void;
// }

type QueryParser<T> = {
  [key in keyof T]: (v: string) => T[key];
};

// interface IRouter {
//   register: <T extends IApi>(
//     info: T & { query: QueryParser<T['query']> },
//   ) => void;

//   dispatch: () => void;
// }

type HttpVerb = 'get' | 'post' | 'put' | 'delete';
type Handler = (
  request: IRequest,
  queryObject: object,
) => Promise<IResponse> | IResponse;
type VerbHandler = { [key in HttpVerb]: Handler };
interface IApiMap {
  [key: string]: Partial<VerbHandler>;
}

type IRoute<T extends IApi> = {
  path: string;
  method?: string;
  query?: QueryParser<T['query']>;
};
// type IRoute<T extends IApi> = Omit<T, 'query' | 'request' | 'response'> & {
//   query: QueryParser<T['query']>;
// };

interface IResponseAdapter {
  adapt: (handler: Handler) => RouterHandler;
}

type RouterHandler = (
  request: IRequest,
  cb: INetworkRequestExecutorListener,
) => // routeParams: object,
void | Promise<void>;
interface IRouter {
  // register: <T extends IApi>(
  //   info: T & { query: QueryParser<T['query']> },
  // ) => this;
  // dispatch: RouterHandler;
  // use(method: string, path: string, handler: RouterHandler): this;
  use(method: string, path: string, handler: Handler): this;
  match(option: { method: string; path: string }): Nullable<Handler>;
  dispatch(request: IRequest): ReturnType<Handler>;
}
interface IMockServer {
  handle: RouterHandler;
}

export {
  IRequest,
  INetworkRequestExecutorListener,
  IResponse,
  IRoute,
  IApi,
  IApiMap,
  VerbHandler,
  IApiContract,
  Handler,
  // IRouterHandler,
  IMockServer,
  RouterHandler,
  QueryParser,
  IRouter,
  IResponseAdapter,
};
