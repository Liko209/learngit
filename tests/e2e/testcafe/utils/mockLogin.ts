/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-09-16 20:51:19
 * Copyright © RingCentral. All rights reserved.
 */

import { BlankPage } from '../page-models/pages/BlankPage';
import { AuthInfo } from './login';
import { SITE_URL } from '../config';
import { requestMock } from './requestMock';

async function mockRequest(t: TestController, account: string = 'default') {
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
  await t.addRequestHooks(mock);
}

function go2Home(t: TestController) {
  return new BlankPage(t).chain(async (t: TestController) => {
    await t.navigateTo(
      `${SITE_URL}?state=%2F&code=U0pDQ2g1LTIzQkowVzdjV3lCQXxBQQ`,
    );
  });
}

export { go2Home, mockRequest };
