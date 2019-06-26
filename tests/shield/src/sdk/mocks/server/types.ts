import {
  IRequest,
  INetworkRequestExecutorListener,
  IResponse,
} from 'foundation/network/network';

export { IRequest, IResponse, INetworkRequestExecutorListener };
export type RouterHandler = (
  request: IRequest,
  cb: INetworkRequestExecutorListener,
  routeParams: object,
) => void | Promise<void>;
export interface IRouter {
  dispatch: RouterHandler;
  use(method: string, path: string, handler: RouterHandler): this;
}

export type PathMatcher = (routePath: string, path: string) => boolean;

export interface IMockServer {
  handle: RouterHandler;
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
