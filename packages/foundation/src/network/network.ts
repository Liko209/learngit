/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-16 14:22:56
 * Copyright © RingCentral. All rights reserved.
 */

type IToken = {
  timestamp: number;
  access_token?: string;
  expires_in: number;
  refresh_token_expires_in: number;
  refresh_token?: string;
};
interface IHandleType {
  name: NETWORK_HANDLE_TYPE;
  survivalModeSupportable: boolean;
  tokenExpirable: boolean;
  tokenRefreshable: boolean;
  defaultVia: NETWORK_VIA;
  doRefreshToken: (token: IToken) => Promise<IToken>;
  checkServerStatus: (
    callback: (success: boolean, interval: number) => void,
  ) => void;
  onRefreshTokenFailure: () => void;
  basic: () => string;
  requestDecoration: (
    tokenHandler: ITokenHandler,
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
  isPause: () => boolean;
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
  onFailure: (response: IResponse) => void;
  onSuccess: (response: IResponse) => void;
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
  'X-RC-Access-Token-Data'?: string;
};

interface IRequest {
  readonly id: string;
  path: string;
  readonly method: NETWORK_METHOD;
  data: object | string;
  headers: Header;
  params: object;
  handlerType: IHandleType;
  priority: REQUEST_PRIORITY;
  HAPriority: HA_PRIORITY;
  via: NETWORK_VIA;
  retryCount: number;
  host: string;
  timeout: number;
  requestConfig: object;
  readonly authFree: boolean;

  callback?: (response: IResponse) => void;
  needAuth(): boolean;
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
  TOO_MANY_REQUESTS = 429,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIME_OUT = 504,
}

enum NETWORK_METHOD {
  GET = 'get',
  DELETE = 'delete',
  HEAD = 'head',
  OPTIONS = 'options',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
}

enum REQUEST_PRIORITY {
  SPECIFIC,
  HIGH,
  NORMAL,
  LOW,
}

enum HA_PRIORITY {
  BASIC,
  HIGH,
}

enum NETWORK_VIA {
  HTTP,
  SOCKET,
  ALL,
}

enum CONSUMER_MAX_QUEUE_COUNT {
  HTTP = 5,
  SOCKET = 10,
}

enum REQUEST_WEIGHT {
  HIGH = 20,
  NORMAL = 10,
}

enum NETWORK_FAIL_TYPE {
  CANCELLED = 'CANCELLED',
  SERVER_ERROR = 'SERVER ERROR',
  TIME_OUT = 'TIME OUT',
  NOT_NETWORK_CONNECTION = 'NOT NETWORK CONNECTION',
  UNAUTHORIZED = 'UNAUTHORIZED',
  BAD_REQUEST = 'BAD REQUEST',
  BAD_GATEWAY = 'Bad Gateway',
  SERVICE_UNAVAILABLE = 'Service Unavailable',
}

enum SURVIVAL_MODE {
  NORMAL = 'normal',
  SURVIVAL = 'survival',
  OFFLINE = 'offline',
}

enum NETWORK_REQUEST_EXECUTOR_STATUS {
  IDLE = 'idle',
  EXECUTING = 'executing',
  PAUSE = 'pause',
  COMPLETION = 'completion',
}

enum NETWORK_HANDLE_TYPE {
  DEFAULT = 'DEFAULT',
  GLIP = 'GLIP',
  GLIP2 = 'GLIP2',
  CUSTOM = 'CUSTOM',
  UPLOAD = 'UPLOAD',
  RINGCENTRAL = 'RINGCENTRAL',
}

export {
  NETWORK_REQUEST_EXECUTOR_STATUS,
  SURVIVAL_MODE,
  NETWORK_FAIL_TYPE,
  REQUEST_WEIGHT,
  CONSUMER_MAX_QUEUE_COUNT,
  NETWORK_VIA,
  REQUEST_PRIORITY,
  HA_PRIORITY,
  NETWORK_METHOD,
  HTTP_STATUS_CODE,
  IToken,
  IClient,
  Header,
  IRequest,
  IResponse,
  INetworkRequestExecutor,
  INetworkRequestExecutorListener,
  IResponseListener,
  INetworkRequestProducer,
  INetworkRequestConsumerListener,
  ITokenHandler,
  IRequestDecoration,
  ITokenRefreshListener,
  IHandleType,
  NETWORK_HANDLE_TYPE,
};
