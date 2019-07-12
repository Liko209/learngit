/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:17:43
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import pathToRegexp from 'path-to-regexp';
import { createDebug } from 'sdk/__tests__/utils';
import { AccountService } from 'sdk/module/account';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { notificationCenter, SERVICE } from 'sdk/service';

import { wait } from '../utils';
import { GlipDataHelper } from './mocks/server/glip/data/data';
import { MockGlipServer } from './mocks/server/glip/MockGlipServer';
import { GlipData, InitialData } from './mocks/server/glip/types';
import { parseInitialData } from './mocks/server/glip/utils';
import { InstanceManager } from './mocks/server/InstanceManager';
import { ProxyServer } from './mocks/server/ProxyServer';
import { blockExternalRequest } from './utils';
import assert = require('assert');
import { MockResponse, IMockRequestResponse } from './types';
import { sdk } from 'sdk/index';
import { globalConfig } from './globalConfig';
import { EnvConfig } from 'sdk/module/env/config';
import { MockSocketServer } from './mocks/server/MockSocketServer';
import { SocketServerManager } from './mocks/server/SocketServerManager';

const debug = createDebug('SdkItFramework');
blockExternalRequest();

type ItContext = {
  // ACCOUNT user info
  userContext: {
    currentUserId: () => number;
    currentCompanyId: () => number;
  };
  // ACCOUNT data template
  template: {
    BASIC: InitialData;
    STANDARD: InitialData;
  };
  // some useful helper for  test
  helper: {
    // apply template
    useInitialData: (initialData: InitialData) => GlipData;
    // model build helper
    glipDataHelper: () => GlipDataHelper;
    // mock api response
    mockResponse: MockResponse;
    // glip socketServer, use to send message to client.
    socketServer: MockSocketServer;
    clearMocks: () => void;
  };
  // sdk setup/cleanUp
  sdk: {
    setup: (mode?: 'glip' | 'rc') => Promise<void>;
    cleanUp: () => Promise<void>;
  };
};
function clearMocks() {
  jest.clearAllMocks();
  jest.resetModules();
  jest.restoreAllMocks();
}

async function initSdk() {
  EnvConfig.disableSplitIo(true);
  EnvConfig.disableLD(true)
  await sdk.init({});
}

async function login() {
  await ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  ).unifiedLogin({ code: 'mockCode', token: 'mockToken' });
}

async function onLogin(mode: 'glip' | 'rc' = 'glip') {
  return new Promise(resolve => {
    notificationCenter.once(mode === 'glip' ? SERVICE.GLIP_LOGIN : SERVICE.RC_LOGIN, () => resolve());
  });
}

async function setup(mode: 'glip' | 'rc' = 'glip') {
  debug('setup sdk');
  globalConfig.set('mode', mode);
  await initSdk();
  login();
  await onLogin(mode);
  await wait();
  debug('setup sdk cost end.');
}

async function cleanUp() {
  debug('cleanUp sdk');
  await ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  ).logout();
  clearMocks();
  debug('clean sdk end.');
}

export function itForSdk(
  name: string,
  caseExecutor: (itCtx: ItContext) => void,
) {
  let userId: number;
  let companyId: number;
  const proxyServer = InstanceManager.get(ProxyServer);
  // const fileServer = InstanceManager.get(CommonFileServer);
  const mockGlipServer = InstanceManager.get(MockGlipServer);
  const useAccount = (_companyId: number, _userId: number) => {
    userId = _userId;
    companyId = _companyId;
    return new GlipDataHelper(_companyId, _userId);
  };
  let glipData: GlipData;
  let glipDataHelper: GlipDataHelper;
  const useInitialData = (initialData: InitialData) => {
    glipData = parseInitialData(initialData);
    glipDataHelper = useAccount(initialData.company_id, initialData.user_id);
    return glipData;
  };

  const getGlipDataHelper = () => {
    assert(glipDataHelper, 'Please useInitialData firstly.');
    return glipDataHelper;
  };

  const applyData = () => {
    mockGlipServer.applyGlipData(glipData);
  };

  const mockResponse: MockResponse = (requestResponse, extractor, mapper) => {
    if (!jest.isMockFunction(proxyServer.getRequestResponsePool)) {
      const requestResponsePool: IMockRequestResponse[] = [];
      jest
        .spyOn(proxyServer, 'getRequestResponsePool')
        .mockImplementation(() => requestResponsePool);
    }
    const extractResult = extractor
      ? extractor(requestResponse as any)
      : requestResponse;
    const pool = proxyServer.getRequestResponsePool();
    pool.push({
      ...requestResponse,
      mapper,
      pathRegexp: pathToRegexp(requestResponse.path),
    });
    return extractResult;
  };

  // provide for it case to mock data.
  const itCtx: ItContext = {
    helper: {
      clearMocks,
      mockResponse,
      useInitialData,
      socketServer: SocketServerManager.get('glip'),
      glipDataHelper: getGlipDataHelper,
    },
    userContext: {
      currentUserId: () => userId,
      currentCompanyId: () => companyId,
    },
    template: {
      BASIC: require('./mocks/server/glip/data/template/accountData/empty-account.json'),
      STANDARD: require('./mocks/server/glip/data/template/accountData/test-account.json'),
    },
    sdk: {
      cleanUp,
      setup: async (mode: 'glip' | 'rc' = 'glip') => {
        applyData();
        await setup(mode);
      },
    },
  };
  describe(name, () => {
    caseExecutor(itCtx);
  });
}
