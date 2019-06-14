import {
  IMockServer,
  INetworkRequestExecutorListener,
  IRequest,
} from './types';

import { Router } from './Router';
import url from 'url';
import path from 'path';
import fs from 'fs';

export class CommonFileServer implements IMockServer {
  private _router: Router;
  constructor() {
    this._router = new Router((routePath, path) => {
      return true;
    });

    // this._router.use('get', '*', this.handler);
    // this._router.use('post', '*', this.handler);
  }

  handle = (request: IRequest, cb: INetworkRequestExecutorListener) => {
    const mockJsonPath = this.getMockJsonPath(request.host, request.path);
    if (fs.existsSync(mockJsonPath)) {
      console.log(
        `-- CommonFileServer -- request: ${request.host}${
          request.path
        }\nmatch: ${mockJsonPath}`,
      );
      const result = JSON.parse(
        fs.readFileSync(`${mockJsonPath}`, {
          encoding: 'utf8',
        }),
      );
      // return result;
      cb.onSuccess({ request, ...result.response });
    } else {
      console.log(
        `-- CommonFileServer -- request: ${request.host}${
          request.path
        }\n not match`,
      );
      cb.onFailure({
        request,
        data: {},
        status: 404,
        statusText: 'Mock data not found',
        headers: {},
      } as any);
    }
  }

  getMockJsonPath = (host: string, uri: string) => {
    const { hostname } = url.parse(host);
    const relatePath = `${hostname}${uri}`;
    const mockDataPath = path.resolve(
      __dirname,
      '../../../../../',
      `./testingData/http/${relatePath}/200.json`,
    );
    // console.log('TCL: Router -> getMockJsonPath -> mockDataPath', mockDataPath);
    return mockDataPath;
  }

  getRouter = () => this._router;
}
