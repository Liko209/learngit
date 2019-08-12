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
} from './mocks/glip/data/data';
import { MockGlipServer } from './mocks/glip/MockGlipServer';
import { GlipData, InitialData } from './mocks/glip/types';
import { parseInitialData } from './mocks/glip/utils';
import { InstanceManager } from './server/InstanceManager';
import { ProxyServer } from './server/ProxyServer';
import { SocketServerManager } from './server/SocketServerManager';
import {
  IMockRequestResponse,
  MockApi,
  MockResponse,
  ItContext,
} from './types';
import { IGlipIndex } from './mocks/glip/api/index/index.get.contract';
import {
  blockExternalRequest,
  createApiResponse,
  createResponse,
} from './utils';
import { GlipScenario } from 'shield/sdk/mocks/glip/GlipScenario';

import assert = require('assert');
const debug = createDebug('SdkItFramework');
blockExternalRequest();

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

export function jit(name: string, caseExecutor: (itCtx: ItContext) => void) {
  let userId: number;
  let companyId: number;
  const proxyServer = InstanceManager.get(ProxyServer);
  const mockGlipServer = InstanceManager.get(MockGlipServer);
  const useAccount = (_companyId: number, _userId: number) => {
    userId = _userId;
    companyId = _companyId;
    globalConfig.set('userId', String(userId));

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
    const pathRegexp = pathToRegexp(requestResponse.path);
    const mockRequestResponse = {
      ...requestResponse,
      mapper,
      pathRegexp,
      pathRegexpString: String(pathRegexp),
    };
    pool.push(mockRequestResponse);
    return extractResult;
  };

  const mockApi: MockApi = (apiPath, response, extractor, mapper) => {
    return mockResponse(
      createApiResponse(apiPath, response),
      extractor,
      mapper,
    );
  };

  function isExtendsOf(target: any, prototype: any): boolean {
    if (!prototype) {
      return false;
    }
    if (prototype === target) {
      return true;
    }
    if (prototype !== Object.prototype) {
      return isExtendsOf(target, Reflect.getPrototypeOf(prototype));
    }
    return false;
  }

  const useScenario: ItContext['helper']['useScenario'] = async (
    cls,
    props,
  ) => {
    if (isExtendsOf(GlipScenario, cls)) {
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
      const result = new cls(
        itCtx,
        createInitialDataHelper(emptyIndexData),
        props,
      );
      return new Promise(resolve => {
        debug('useScenario: sync scenario data');
        mockApi(IGlipIndex, createResponse({ data: emptyIndexData }));
        sdk.syncService.syncData({
          onIndexHandled: async () => {
            resolve(result as any);
          },
        });
      });
    }
    return {} as any;
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
      BASIC: require('./mocks/glip/data/template/accountData/empty-account.json'),
      STANDARD: require('./mocks/glip/data/template/accountData/test-account.json'),
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
