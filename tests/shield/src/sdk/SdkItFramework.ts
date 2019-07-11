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
import { blockExternalRequest } from './utils/network/blockExternalRequest';
import assert = require('assert');
import { MockResponse, IRegexpRequestResponse } from './types';
import { sdk } from 'sdk/index';
import { globalConfig } from './globalConfig';

const debug = createDebug('SdkItFramework');
blockExternalRequest();

type ItContext = {
  currentUserId: () => number;
  currentCompanyId: () => number;
  mockResponse: MockResponse;
  data: {
    template: {
      BASIC: InitialData;
      STANDARD: InitialData;
    };
    useInitialData: (initialData: InitialData) => GlipData;
    helper: () => GlipDataHelper;
  };
  sdk: {
    setup: () => Promise<void>;
    cleanUp: () => Promise<void>;
  };
};
function clearMocks() {
  jest.clearAllMocks();
  jest.resetModules();
  jest.restoreAllMocks();
}

async function initSdk() {
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
  let dataHelper: GlipDataHelper;
  const useInitialData = (initialData: InitialData) => {
    glipData = parseInitialData(initialData);
    dataHelper = useAccount(initialData.company_id, initialData.user_id);
    return glipData;
  };

  const helper = () => {
    assert(dataHelper, 'Please useInitialData firstly.');
    return dataHelper;
  };

  const applyData = () => {
    mockGlipServer.applyGlipData(glipData);
  };

  const mockResponse: MockResponse = (requestResponse, extractor) => {
    if (!jest.isMockFunction(proxyServer.getRequestResponsePool)) {
      const requestResponsePool: IRegexpRequestResponse[] = [];
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
      pathRegexp: pathToRegexp(requestResponse.path),
    });
    return extractResult;
  };

  // provide for it case to mock data.
  const itCtx: ItContext = {
    mockResponse,
    currentUserId: () => userId,
    currentCompanyId: () => companyId,
    data: {
      useInitialData,
      helper,
      template: {
        BASIC: require('./mocks/server/glip/data/template/accountData/empty-account.json'),
        STANDARD: require('./mocks/server/glip/data/template/accountData/test-account.json'),
      },
    },
    sdk: {
      cleanUp,
      setup: async () => {
        applyData();
        await setup();
      },
    },
  };
  describe(name, () => {
    caseExecutor(itCtx);
  });
}
