import {
  IRequest,
  INetworkRequestExecutorListener,
  IResponse,
} from 'foundation/src/network/network';
import { ExtendedBaseModel } from 'sdk/module/models/ExtendedBaseModel';

export { IRequest, IResponse, INetworkRequestExecutorListener };
export type RouterHandler = (
  request: IRequest,
  cb: INetworkRequestExecutorListener,
) => void;
export interface IRouter {
  dispatch: RouterHandler;
  use(method: string, path: string, handler: RouterHandler): this;
}

// request,
// data: {},
// status: 404,
// statusText: 'Mock data not found',
// headers: {},

// export type Request = {
//   host: string;
//   path: string;
//   headers?: {};
// };
// export type Response = {
//   status: number;
//   request: any;
//   data: any;
//   statusText: string;
//   headers: object;
// };

// export type ReplyCallback = {
//   onSuccess: (response: IResponse) => void;
//   onFailure: (response: IResponse) => void;
// };

export type PathMatcher = (routePath: string, path: string) => boolean;

export interface IMockServer {
  // host: string;
  handle: (request: IRequest, cb: INetworkRequestExecutorListener) => void;
  // api: [{ path: string | RegExp; method: HttpMethod; handler: IApiHandler }];
  // getRouter: () => IRouter;
}

export interface IStore<
  Id extends number | string,
  T extends ExtendedBaseModel<Id>
> {
  // items: T[];
  create(item: Partial<T>): T | undefined;
  delete(id: Id): void;
  update(item: Partial<T>): void;
  getById(id: Id): T | null;
  getByIds(ids: Id[]): (T | undefined)[];
  getItems(options: { limit: number; direction: string }): T[];
}
