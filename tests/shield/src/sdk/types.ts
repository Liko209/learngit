/*
 * @Author: Paynter Chen
 * @Date: 2019-07-05 10:56:08
 * Copyright © RingCentral. All rights reserved.
 */

import * as Factory from 'factory.ts';
import {
  IBaseRequest,
  IBaseResponse,
  INetworkRequestExecutorListener,
  IRequest as IJRequest,
  IResponse as IJResponse,
} from 'foundation/network/network';
import { Nullable } from 'sdk/types';
import { GlipInitialDataHelper, GlipDataHelper } from './mocks/glip/data/data';
import { InitialData } from './mocks/glip/types';
import { MockSocketServer } from './server/MockSocketServer';
import { BaseScenario } from 'shield/sdk/BaseScenario';

type ItContext = {
  // ACCOUNT user info
  userContext: {
    glipUserId: () => number;
    glipCompanyId: () => number;
  };
  // ACCOUNT data template
  template: {
    BASIC: InitialData;
    STANDARD: InitialData;
  };
  // some useful helper for  test
  helper: {
    // apply template
    useInitialData: (initialData: InitialData) => GlipInitialDataHelper;
    // model build helper
    glipDataHelper: () => GlipDataHelper;
    mockResponse: MockResponse;
    // mock api response
    mockApi: MockApi;
    // glip socketServer, use to send message to client.
    socketServer: MockSocketServer;
    clearMocks: () => void;
    useScenario: <
      T extends BaseScenario<any>,
      P = T extends BaseScenario<infer P> ? P : object,
      Props extends P = P
    >(
      scenarioClass: { new (...arg: any): T },
      props?: Props,
    ) => Promise<T>;
  };
  // sdk setup/cleanUp
  sdk: {
    setup: (mode?: 'glip' | 'rc') => Promise<void>;
    cleanUp: () => Promise<void>;
  };
};
interface IApiPath<T extends IApiContract> {
  host: T['host'];
  method: T['method'];
  path: T['path'];
}

interface IApiContract<Req = any, Res = any> {
  host: string;
  path: string;
  method: string;
  pathParams?: object;
  request: Partial<Pick<IBaseRequest<Req>, 'data'>>;
  response: Pick<IBaseResponse<Res>, 'data'>;
}

type QueryParser<T> = { [key in keyof T]: (v: string) => T[key] };

type JRequestHandler = (
  request: IJRequest,
  cb: INetworkRequestExecutorListener,
) => void | Promise<void>;

type RequestHandler = (
  request: IJRequest,
  queryObject?: object,
) => Promise<IJResponse> | IJResponse;

type IRoute<T extends IApiContract> = {
  path: string;
  method?: string;
  query?: QueryParser<T['pathParams']>;
};

interface IResponseAdapter {
  adapt: (handler: RequestHandler) => JRequestHandler;
}

interface IRouter {
  use(method: string, path: string, handler: RequestHandler): this;
  match(option: { method: string; path: string }): Nullable<RequestHandler>;
  dispatch(request: IJRequest): ReturnType<RequestHandler>;
}

interface IMockServer {
  handleRequest: JRequestHandler;
}

type MockApi = <
  A extends IApiContract<any, any> = IApiContract<any, any>,
  ReqData = A extends IApiContract<infer B, any> ? B : any,
  ResData = A extends IApiContract<any, infer B> ? B : any,
  T extends (api: A) => any = (api: IApiContract<ReqData, ResData>) => any
>(
  options: IApiPath<A>,
  data: Partial<A['response'] | IBaseResponse<ResData>>,
  extractor?: T,
  mapper?: (
    request: IJRequest<ReqData>,
    mockRequestResponse: IMockRequestResponse<ReqData, ResData>,
  ) => IJResponse<ResData>,
) => ReturnType<T>;

type MockResponse = <
  A extends IApiContract<any, any> = IApiContract<any, any>,
  ReqData = A extends IApiContract<infer B, any> ? B : any,
  ResData = A extends IApiContract<any, infer B> ? B : any,
  T extends (api: A) => any = (api: IApiContract<ReqData, ResData>) => any
>(
  requestResponse: IRequestResponse<ReqData, ResData>,
  extractor?: T,
  mapper?: (
    request: IJRequest<ReqData>,
    mockRequestResponse: IMockRequestResponse<ReqData, ResData>,
  ) => IJResponse<ResData>,
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
  channel: 'request';
  data: ISocketRequest<T>;
}

interface ISocketResponseInfo<T = any> extends ISocketInfo {
  channel: 'response';
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

interface IMockRequestResponse<Req = any, Res = any> extends IRequestResponse {
  pathRegexp: RegExp;
  pathRegexpString: string;
  mapper?: (
    request: IJRequest,
    mockRequestResponse: IMockRequestResponse,
  ) => IJResponse;
}

interface ISocketInfo<T = any> extends INetworkInfo {
  type: 'socket-message';
  // url: string;
  protocol: string;
  direction: 'send' | 'receive';
  rawData: string;
  channel?: string;
  data?: T;
}

type IFactory<T = any> = Factory.Factory<T>;

interface IScenarioDataHelper<T> {
  factory: IFactory<T>;
}

export {
  ItContext,
  IJRequest,
  IJResponse,
  IBaseRequest,
  IBaseResponse,
  INetworkRequestExecutorListener,
  IRoute,
  IApiContract,
  IApiPath,
  RequestHandler,
  IMockServer,
  JRequestHandler,
  QueryParser,
  IRouter,
  IResponseAdapter,
  MockApi,
  MockResponse,
  ISocketRequest,
  ISocketResponse,
  INetworkInfo,
  ISocketRequestInfo,
  ISocketResponseInfo,
  IRequestResponse,
  IMockRequestResponse,
  ISocketInfo,
  IFactory,
  IScenarioDataHelper,
};
