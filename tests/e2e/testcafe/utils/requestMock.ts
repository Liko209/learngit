/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-09-15 21:38:19
 * Copyright © RingCentral. All rights reserved.
 */
import { RequestMock } from 'testcafe';
import { SITE_URL } from '../config';
const fs = require('fs');

interface IRequestMockData {
  requestUri: string | RegExp;
  responseFile: string;
  statusCode: number;
  headers?: object;
}

const defaultHeaders = {
  'content-type': 'application/json;charset=UTF-8',
  'access-control-allow-credentials': 'true',
  'access-control-allow-origin': SITE_URL,
  'access-control-allow-methods': 'POST, PUT, GET, OPTIONS',
  'access-control-allow-headerx-frame-options': 'SAMEORIGIN',
};

function requestMock(data: IRequestMockData[]): RequestMock {
  let requestMock = RequestMock();

  // const responseHeader = defaultHeaders;
  data.forEach((item: IRequestMockData) => {
    const rawData = fs.readFileSync(item.responseFile);
    const jsonData = JSON.parse(rawData);
    requestMock = requestMock
      .onRequestTo(item.requestUri)
      .respond(jsonData, item.statusCode, defaultHeaders);
  });
  return requestMock;
}

export { IRequestMockData, requestMock };
