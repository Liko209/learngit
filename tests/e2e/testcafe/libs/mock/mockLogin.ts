/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-09-16 20:51:19
 * Copyright © RingCentral. All rights reserved.
 */
import { requestMock } from './requestMock';
import { AuthInfo, go2PageWithAuth } from '../../utils';
import { SITE_URL } from '../../config';

function mockLoginRequest(account: string = 'default'): RequestMock {
  const accountFolder = account;
  const mock = requestMock([
    {
      requestUri: /initial/,
      responseFile: `mock/${accountFolder}/initial.json`,
      statusCode: 200,
    },

    {
      requestUri: /restapi\/oauth\/token/,
      responseFile: `mock/${accountFolder}/token.json`,
      statusCode: 200,
    },

    {
      requestUri: /generate-code/,
      responseFile: `mock/${accountFolder}/generate-code.json`,
      statusCode: 200,
    },
    {
      requestUri: /api\/login/,
      responseFile: `mock/${accountFolder}/login.json`,
      statusCode: 200,
    },
    {
      requestUri: /remaining/,
      responseFile: `mock/${accountFolder}/remaining.json`,
      statusCode: 200,
    },
    {
      requestUri: /extension/,
      responseFile: `mock/${accountFolder}/extension.json`,
      statusCode: 200,
    },

    {
      requestUri: /profile/,
      responseFile: `mock/${accountFolder}/profile.json`,
      statusCode: 200,
    },
    {
      requestUri: /index/,
      responseFile: `mock/${accountFolder}/index.json`,
      statusCode: 200,
    },
  ]);

  return mock;
}

function directLogin(t: TestController, authInfo?: AuthInfo) {
  return go2PageWithAuth(t, `${SITE_URL}?state=%2F&code=authcode`);
}

export { mockLoginRequest, directLogin };
