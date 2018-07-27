/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-16 14:22:56
 * Copyright © RingCentral. All rights reserved.
 */

type IToken = {
  timestamp: number;
  access_token?: string;
  accessTokenExpireIn: number;
  refreshTokenExpireIn: number;
  refreshToken?: string;
};
interface IHandleType {
  survivalModeSupportable: boolean;
  tokenExpirable: boolean;
  tokenRefreshable: boolean;
  doRefreshToken: (token: IToken) => Promise<IToken>;
  basic: () => string;
  requestDecoration: (
    tokenHandler: ITokenHandler
  ) => (request: IRequest) => IRequest;
}

interface ITokenRefreshListener {
  onRefreshTokenFailure: (type: IHandleType) => void;
  onRefreshTokenSuccess: (type: IHandleType, token: IToken) => void;
}

interface INetworkRequestExecutor {
  execute: () => void;
  getRequest: () => IRequest;
  cancel: () => void;
  isPause: () => void;
}

interface IRequestDecoration {
  decorate: (request: IRequest) => void;
}

interface ITokenHandler {
  isAccessTokenRefreshable: () => boolean;
  doRefreshToken: (token: IToken) => Promise<IToken>;
  willAccessTokenExpired: () => boolean;
}

interface INetworkRequestConsumerListener {
  onConsumeArrived: () => void;
  onConsumeFinished: (executor: INetworkRequestExecutor) => void;
  onCancelAll: () => void;
  onCancelRequest: (request: IRequest) => void;
  onTokenRefreshed: () => void;
}
interface INetworkRequestProducer {
  produceRequest: (via: NETWORK_VIA) => IRequest | undefined;
}

interface IResponseListener {
  onAccessTokenInvalid: (handlerType: IHandleType) => void;
  onSurvivalModeDetected: (mode: SURVIVAL_MODE, retryAfter: number) => void;
}
interface INetworkRequestExecutorListener {
  onFailure: (requestId: string, response: IResponse) => void;
  onSuccess: (requestId: string, response: IResponse) => void;
}

interface IResponse {
  readonly data: any;
  readonly status: HTTP_STATUS_CODE;
  readonly statusText: string;
  readonly headers: object;
  readonly retryAfter: number;
  request: IRequest;
}

type Header = {
  Authorization?: string;
};

interface IRequest {
  readonly id: string;
  readonly path: string;
  readonly method: NETWORK_METHOD;
  data: object | string;
  headers: Header;
  params: object;
  handlerType: IHandleType;
  priority: REQUEST_PRIORITY;
  via: NETWORK_VIA;
  retryCount: number;
  host: string;
  timeout: number;
  requestConfig: object;
  readonly authFree: boolean;

  callback?: (response: IResponse) => void;
  needAuth(): boolean;
}

interface IRequestBuilderOption {
  host?: string;
  path: string;
  method: NETWORK_METHOD;
  handlerType: IHandleType;
  headers?: Header;
  params?: object;
  data?: object;
  authFree?: boolean;
  requestConfig?: object;
}

interface IClient {
  request(request: IRequest, listener: INetworkRequestExecutorListener): void;
  cancelRequest(request: IRequest): void;
  isNetworkReachable(): boolean;
}

enum HTTP_STATUS_CODE {
  DEFAULT = 0,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503
}

enum NETWORK_METHOD {
  GET = 'get',
  DELETE = 'delete',
  HEAD = 'head',
  OPTIONS = 'options',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch'
}

enum REQUEST_PRIORITY {
  SPECIFIC,
  HIGH,
  NORMAL,
  LOW
}

enum NETWORK_VIA {
  HTTP,
  SOCKET,
  ALL
}

enum CONSUMER_MAX_QUEUE_COUNT {
  HTTP = 5,
  SOCKET = 5
}

enum REQUEST_WEIGHT {
  HIGH = 20,
  NORMAL = 10
}

enum NETWORK_FAIL_TYPE {
  CANCELLED = 'CANCELLED',
  SERVER_ERROR = 'SERVER ERROR',
  TIME_OUT = 'ECONNABORTED',
  NOT_NETWORK_CONNECTION = 'NOT NETWORK CONNECTION',
  UNAUTHORIZED = 'UNAUTHORIZED',
  BAD_REQUEST = 'BAD REQUEST'
}

enum SURVIVAL_MODE {
  NORMAL = 'normal',
  SURVIVAL = 'survival',
  OFFLINE = 'offline'
}

enum NETWORK_REQUEST_EXECUTOR_STATUS {
  IDLE = 'idle',
  EXECUTING = 'executing',
  PAUSE = 'pause',
  COMPLETION = 'completion'
}

export {
  NETWORK_REQUEST_EXECUTOR_STATUS,
  SURVIVAL_MODE,
  NETWORK_FAIL_TYPE,
  REQUEST_WEIGHT,
  CONSUMER_MAX_QUEUE_COUNT,
  NETWORK_VIA,
  REQUEST_PRIORITY,
  NETWORK_METHOD,
  HTTP_STATUS_CODE,
  IToken,
  IClient,
  Header,
  IRequest,
  IResponse,
  IRequestBuilderOption,
  INetworkRequestExecutor,
  INetworkRequestExecutorListener,
  IResponseListener,
  INetworkRequestProducer,
  INetworkRequestConsumerListener,
  ITokenHandler,
  IRequestDecoration,
  ITokenRefreshListener,
  IHandleType
};
