/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:04
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IMockServer,
  INetworkRequestExecutorListener,
  IJRequest,
} from 'shield/sdk/types';

import url from 'url';
import path from 'path';
import fs from 'fs';
import { createDebug } from 'sdk/__tests__/utils';
import { globalConfig } from 'shield/sdk/globalConfig';

const debug = createDebug('FileServer');
const error = createDebug('FileServer', true);

const DATA_BASE_PATH = path.resolve(__dirname, '../../../', './testingData/');

export class CommonFileServer implements IMockServer {
  handleRequest = (request: IJRequest, cb: INetworkRequestExecutorListener) => {
    const commonPath = this.getMockJsonPath(
      `${DATA_BASE_PATH}/common`,
      request.host,
      request.path,
      request.method,
    );
    const userPath = this.getMockJsonPath(
      `${DATA_BASE_PATH}/${globalConfig.get('userId')}`,
      request.host,
      request.path,
      request.method,
    );
    const filePath = fs.existsSync(userPath)
      ? userPath
      : fs.existsSync(commonPath)
      ? commonPath
      : '';
    if (filePath) {
      const result = JSON.parse(
        fs.readFileSync(`${commonPath}`, {
          encoding: 'utf8',
        }),
      );
      debug(`request: ${request.host}${request.path} match: ${filePath}`);
      cb.onSuccess({ request, ...result.response });
    } else {
      error(
        `request: ${request.host}${
          request.path
        }\n not file match, ${commonPath} not exist.`,
      );
      cb.onFailure({
        request,
        data: {},
        status: 404,
        statusText: 'Mock data not found',
        headers: {},
      } as any);
    }
  };

  getMockJsonPath = (
    base: string,
    host: string,
    uri: string,
    method: string,
  ) => {
    const { hostname, protocol } = url.parse(host);
    const relatePath = `${hostname || host}${uri}`;
    const mockDataPath = path.resolve(
      base,
      protocol ? protocol : '.',
      `${protocol ? `${protocol}/` : ''}${relatePath.replace(
        /\~/g,
        '-',
      )}/${method.toUpperCase()}.template.json`,
    );
    return mockDataPath;
  };
}
