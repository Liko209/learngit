import { Sdk } from 'sdk/index';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { notificationCenter } from 'sdk/service';
import { MockGlipServer } from './mocks/server/glip/MockGlipServer';
import { InstanceManager } from './mocks/server/InstanceManager';
import { CommonFileServer } from './mocks/server/CommonFileServer';
import { GlipDataHelper } from './mocks/server/glip/data/data';
import { InitialData, GlipData, GlipState } from './mocks/server/glip/types';
import { createDebug } from 'sdk/__tests__/utils';
import _ from 'lodash';
import assert = require('assert');
import { parseState } from './mocks/server/glip/utils';
import './blockExternalRequest';
import { IRequestResponse } from './utils/network/networkDataTool';
import { ProxyServer } from './mocks/server/ProxyServer';
const debug = createDebug('SdkItFramework');
type Processor<ResData, ReqData, T> = (
  reqRes: IRequestResponse<ReqData, ResData>,
) => T;
console.warn(222, Promise.prototype);

// global.Promise = WrapPromise;
// type GetProcessorType<T> = T extends Processor<any, any, infer R> ? R: any;

function xx<
  P extends Processor<any, any, any>,
  Q = P extends Processor<any, any, infer R> ? R : any
>(pro: P): Q {
  return pro({} as any);
}

const x = xx(() => {
  return 123;
});
type ItContext = {
  currentUserId: () => number;
  currentCompanyId: () => number;
  mockResponse: <
    ResData = any,
    ReqData = any,
    T extends Processor<ResData, ReqData, any> = Processor<
      ResData,
      ReqData,
      IRequestResponse<ReqData, ResData>
    >
  >(
    requestResponse: IRequestResponse<ReqData, ResData>,
    processor?: T,
  ) => ReturnType<T>;
  data: {
    template: {
      BASIC: InitialData;
      STANDARD: InitialData;
    };
    useInitialData: (initialData: InitialData) => GlipData;
    helper: () => GlipDataHelper;
    apply: () => void;
  };
  server: {
    glip: MockGlipServer;
    rc: {};
  };
  sdk: {
    setup: () => Promise<void>;
    cleanUp: () => Promise<void>;
  };
};

function parseInitialData(initialData: InitialData): GlipData {
  const company = _.find(
    initialData.companies,
    item => item._id === initialData.company_id,
  )!;
  const user = _.find(
    initialData.people,
    item => item._id === initialData.user_id,
  )!;
  assert(company, 'Data invalid. company_id not found in companies');
  assert(user, 'Data invalid. user_id not found in people');
  // initialData.profile.
  const userGroupStates = parseState(initialData.state);
  const result: GlipData = {
    company,
    user,
    people: initialData.people,
    groups: initialData.groups,
    teams: initialData.teams,
    clientConfig: initialData.client_config,
    state: initialData.state,
    posts: initialData.posts || [],
    // todo parse to groupState
    groupState: userGroupStates,
    profile: initialData.profile,
  };
  return result;
}

function clearMocks() {
  jest.clearAllMocks();
  jest.resetModules();
  jest.restoreAllMocks();
}

async function initSdk() {
  await Sdk.init({});
}

async function login() {
  await ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  ).unifiedLogin({ code: 'mockCode', token: 'mockToken' });
}

async function initEnd() {
  return new Promise(resolve => {
    notificationCenter.once('TotallyInit', () => resolve());
  });
}

async function setup() {
  debug('setup sdk');
  await initSdk();
  login();
  await initEnd();
  await new Promise(resolve => setTimeout(resolve, 1));
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
  const fileServer = InstanceManager.get(CommonFileServer);
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

  const apply = () => {
    mockGlipServer.applyGlipData(glipData);
  };

  function mockResponse<ReqData, ResData>(
    requestResponse: IRequestResponse<ReqData, ResData>,
    processor?: (reqRes: IRequestResponse<ReqData, ResData>) => any,
  ): any {
    if (!jest.isMockFunction(proxyServer.getRequestResponsePool)) {
      const requestResponsePool: IRequestResponse[] = [];
      jest
        .spyOn(proxyServer, 'getRequestResponsePool')
        .mockImplementation(() => requestResponsePool);
    }
    let returnValue = requestResponse;
    if (processor) {
      returnValue = processor(requestResponse);
    }
    const pool = proxyServer.getRequestResponsePool();
    pool.push(requestResponse);
    return returnValue;
  }

  // provide for it case to mock data.
  const itCtx: ItContext = {
    mockResponse,
    currentUserId: () => userId,
    currentCompanyId: () => companyId,
    data: {
      useInitialData,
      helper,
      apply,
      template: {
        BASIC: require('./mocks/server/glip/data/template/accountData/empty-account.json'),
        STANDARD: require('./mocks/server/glip/data/template/accountData/test-account.json'),
      },
    },
    server: {
      // inject mock server here
      glip: mockGlipServer,
      rc: {},
    },
    sdk: {
      setup,
      cleanUp,
    },
  };
  describe(name, () => {
    caseExecutor(itCtx);
  });
}
