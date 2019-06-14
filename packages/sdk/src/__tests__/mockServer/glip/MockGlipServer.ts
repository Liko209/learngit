import {
  IMockServer,
  INetworkRequestExecutorListener,
  IRequest,
} from '../types';

import { Router } from '../Router';
import url from 'url';
import path from 'path';
import fs from 'fs';
import { PostStore } from './post';
import { ItemStore } from './item';
import { createResponse } from '../utils';

export class MockGlipServer implements IMockServer {
  private _router: Router;
  postStore: PostStore;
  itemStore: ItemStore;
  constructor() {
    this._router = new Router((routePath, path) => {
      return routePath === path || routePath === '*';
    });
    this.postStore = new PostStore();
    this.itemStore = new ItemStore();

    this._router.use('get', '/api/posts', this.getPosts);
    this._router.use('get', '*', this._handleCommon);
    this._router.use('put', '*', this._handleCommon);
    this._router.use('post', '*', this._handleCommon);
  }

  getPosts = (request: IRequest, cb: INetworkRequestExecutorListener) => {
    console.log('TCL: MockGlipServer -> constructor -> api/posts');
    const { limit = 20, direction = 'older', group_id } = request.params as any;
    cb.onSuccess(
      createResponse({
        request,
        data: {
          posts: this.postStore.getItems({ limit, direction, group_id }),
          items: this.itemStore.getItemsByPostId(),
        },
      }),
    );
  }

  handle = (request: IRequest, cb: INetworkRequestExecutorListener) => {
    this._router.dispatch(request, cb);
  }

  _handleCommon = (request: IRequest, cb: INetworkRequestExecutorListener) => {
    const mockJsonPath = this.getMockJsonPath(request.host, request.path);
    if (fs.existsSync(mockJsonPath)) {
      const result = JSON.parse(
        fs.readFileSync(`${mockJsonPath}`, {
          encoding: 'utf8',
        }),
      );
      // return result;
      cb.onSuccess({ request, ...result.response });
    } else {
      cb.onFailure({
        request,
        data: {},
        status: 404,
        statusText: 'Mock data not found',
        headers: {},
      } as any);
    }
    // if (fs.existsSync(mockJsonPath)) {
    //   // console.log('TCL: MockFileServer -> constructor -> result', result);
    //   cb(null, [200, result.response.data]);
    // } else {

    // }
  }

  // isExist = (uri: string) => {
  //   const isMockPathExist = fs.existsSync(this.getMockJsonPath(uri));
  //   return isMockPathExist;
  // }

  getMockJsonPath = (host: string, uri: string) => {
    const { hostname } = url.parse(host);
    const relatePath = `${hostname}${uri}`;
    const mockDataPath = path.resolve(
      __dirname,
      '../../../../../../',
      `./testingData/http/${relatePath}/200.json`,
    );
    // console.log('TCL: Router -> getMockJsonPath -> mockDataPath', mockDataPath);
    return mockDataPath;
  }

  getRouter = () => this._router;
}
