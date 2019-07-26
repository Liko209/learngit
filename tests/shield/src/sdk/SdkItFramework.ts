/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:17:43
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import pathToRegexp from 'path-to-regexp';
import { createDebug } from 'sdk/__tests__/utils';
import { sdk } from 'sdk/index';
import { AccountService } from 'sdk/module/account';
import { EnvConfig } from 'sdk/module/env/config';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { notificationCenter, SERVICE } from 'sdk/service';

import { wait } from '../utils';
import { globalConfig } from './globalConfig';
import {
  GlipDataHelper,
  createInitialDataHelper,
  GlipInitialDataHelper,
} from './mocks/server/glip/data/data';
import { MockGlipServer } from './mocks/server/glip/MockGlipServer';
import { GlipData, InitialData } from './mocks/server/glip/types';
import { parseInitialData } from './mocks/server/glip/utils';
import { InstanceManager } from './mocks/server/InstanceManager';
import { MockSocketServer } from './mocks/server/MockSocketServer';
import { ProxyServer } from './mocks/server/ProxyServer';
import { SocketServerManager } from './mocks/server/SocketServerManager';
import {
  IMockRequestResponse,
  MockApi,
  MockResponse,
  ScenarioFactory,
} from './types';
import { blockExternalRequest, createApiResponse } from './utils';
import { createResponse } from './mocks/server/utils';

import assert = require('assert');
// import { IGlipIndex } from './mocks/server/glip/api/index/index.get.contract';
const debug = createDebug('SdkItFramework');
blockExternalRequest();

export type ItContext = {
  // ACCOUNT user info
  userContext: {
    glipUserId: () => number;
    glipCompanyId: () => number;
  };
  // ACCOUNT data template
  template: {
    BASIC: InitialData;
    STANDARD: InitialData;
  };
  // some useful helper for  test
  helper: {
    // apply template
    useInitialData: (initialData: InitialData) => GlipInitialDataHelper;
    // model build helper
    glipDataHelper: () => GlipDataHelper;
    mockResponse: MockResponse;
    // mock api response
    mockApi: MockApi;
    // glip socketServer, use to send message to client.
    socketServer: MockSocketServer;
    clearMocks: () => void;
    useScenario: <T extends ScenarioFactory>(
      scenarioFactory: T,
    ) => Promise<ReturnType<T>>;
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
  EnvConfig.disableLD(true);
  await sdk.init({});
}

async function login() {
  await ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  ).unifiedLogin({ code: 'mockRCCode' });
}

async function onLogin(mode: 'glip' | 'rc' = 'glip') {
  return new Promise(resolve => {
    notificationCenter.once(
      mode === 'glip' ? SERVICE.GLIP_LOGIN : SERVICE.RC_LOGIN,
      () => resolve(),
    );
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
  const mockGlipServer = InstanceManager.get(MockGlipServer);
  const useAccount = (_companyId: number, _userId: number) => {
    userId = _userId;
    companyId = _companyId;
    return new GlipDataHelper(_companyId, _userId);
  };
  let glipData: GlipData;
  let glipInitialData: InitialData;
  let glipDataHelper: GlipDataHelper;
  const useInitialData = (initialData: InitialData) => {
    glipInitialData = initialData;
    glipData = parseInitialData(initialData);
    glipDataHelper = useAccount(initialData.company_id, initialData.user_id);
    return createInitialDataHelper(initialData);
    // return glipData;
  };

  const getGlipDataHelper = () => {
    assert(glipDataHelper, 'Please useInitialData firstly.');
    return glipDataHelper;
  };

  const applyData = () => {
    mockGlipServer.applyGlipData(glipData);
  };

  const mockResponse: MockResponse = (requestResponse, extractor, mapper) => {
    // const requestResponse = createSuccessResponse(apiPath, response);
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
    const pathRegexp = pathToRegexp(requestResponse.path);
    pool.push({
      ...requestResponse,
      mapper,
      pathRegexp,
    });
    return extractResult;
  };

  const mockApi: MockApi = (apiPath, response, extractor, mapper) => {
    return mockResponse(
      createApiResponse(apiPath, response),
      extractor,
      mapper,
    );
  };

  const useScenario: ItContext['helper']['useScenario'] = async scenarioFactory => {
    const emptyIndexData: InitialData = _.cloneDeep({
      ...glipInitialData,
      companies: [],
      items: [],
      people: [],
      public_teams: [],
      groups: [],
      teams: [],
      posts: [],
    });
    const result = scenarioFactory(
      itCtx,
      createInitialDataHelper(emptyIndexData),
    );
    return new Promise(resolve => {
      sdk.syncService.syncData({
        onIndexHandled: async () => {
          console.warn('useScenario ->> onIndexHandled');
          resolve(result);
        },
      });
    });
  };
  // provide for it case to mock data.
  const itCtx: ItContext = {
    helper: {
      clearMocks,
      mockResponse,
      mockApi,
      useInitialData,
      socketServer: SocketServerManager.get('glip'),
      glipDataHelper: getGlipDataHelper,
      useScenario,
    },
    userContext: {
      glipUserId: () => userId,
      glipCompanyId: () => companyId,
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
    useInitialData(itCtx.template.BASIC);
    caseExecutor(itCtx);
  });
}
