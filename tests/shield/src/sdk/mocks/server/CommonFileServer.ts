import {
  IMockServer,
  INetworkRequestExecutorListener,
  IJRequest,
} from '../../types';

import url from 'url';
import path from 'path';
import fs from 'fs';
import { createDebug } from 'sdk/__tests__/utils';
const debug = createDebug('FileServer', false);

export class CommonFileServer implements IMockServer {
  handle = (request: IJRequest, cb: INetworkRequestExecutorListener) => {
    const mockJsonPath = this.getMockJsonPath(request.host, request.path);
    if (fs.existsSync(mockJsonPath)) {
      const result = JSON.parse(
        fs.readFileSync(`${mockJsonPath}`, {
          encoding: 'utf8',
        }),
      );
      debug(`request: ${request.host}${request.path}\n match`);
      cb.onSuccess({ request, ...result.response });
    } else {
      debug(`request: ${request.host}${request.path}\n not file match`);
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
      '../../../../',
      `./testingData/http/${relatePath.replace(/\~/g, '-')}/200.json`,
    );
    // console.log('TCL: Router -> getMockJsonPath -> mockDataPath', mockDataPath);
    return mockDataPath;
  }
}
