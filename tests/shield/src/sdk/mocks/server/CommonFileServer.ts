/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:04
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IMockServer,
  INetworkRequestExecutorListener,
  IJRequest,
} from '../../types';

import url from 'url';
import path from 'path';
import fs from 'fs';
import { createDebug } from 'sdk/__tests__/utils';
const debug = createDebug('FileServer', true);

export class CommonFileServer implements IMockServer {
  handle = (request: IJRequest, cb: INetworkRequestExecutorListener) => {
    const mockJsonPath = this.getMockJsonPath(
      request.host,
      request.path,
      request.method,
    );
    if (fs.existsSync(mockJsonPath)) {
      const result = JSON.parse(
        fs.readFileSync(`${mockJsonPath}`, {
          encoding: 'utf8',
        }),
      );
      // debug(`request: ${request.host}${request.path}\n match`);
      cb.onSuccess({ request, ...result.response });
    } else {
      debug(
        `request: ${request.host}${request.path}\n not file match, ${mockJsonPath} not exist.`,
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

  getMockJsonPath = (host: string, uri: string, method: string) => {
    const { hostname, protocol } = url.parse(host);
    const relatePath = `${hostname || host}${uri}`;
    const mockDataPath = path.resolve(
      __dirname,
      '../../../../',
      './testingData/',
      protocol ? protocol : '.',
      `${protocol ? `${protocol}/` : ''}${relatePath.replace(
        /\~/g,
        '-',
      )}/${method.toUpperCase()}.template.json`,
    );
    return mockDataPath;
  }
}
