import {
  IRequest,
  INetworkRequestExecutorListener,
  IResponse,
} from 'foundation/src/network/network';

export { IRequest, IResponse, INetworkRequestExecutorListener };
export type RouterHandler = (
  request: IRequest,
  cb: INetworkRequestExecutorListener,
) => void;
export interface IRouter {
  dispatch: RouterHandler;
  use(method: string, path: string, handler: RouterHandler): this;
}

export type PathMatcher = (routePath: string, path: string) => boolean;

export interface IMockServer {
  // host: string;
  handle: (request: IRequest, cb: INetworkRequestExecutorListener) => void;
  // api: [{ path: string | RegExp; method: HttpMethod; handler: IApiHandler }];
  // getRouter: () => IRouter;
}

export interface IStore<T extends object, Id extends number | string = number> {
  // items: T[];
  create(item: Partial<T>): T | undefined;
  delete(id: Id): void;
  update(item: Partial<T>): void;
  getById(id: Id): T | null;
  getByIds(ids: Id[]): (T | undefined)[];
  getItems(options: { limit: number; direction: string }): T[];
}
