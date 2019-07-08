import { Sdk } from 'sdk/index';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { notificationCenter } from 'sdk/service';
import { MockGlipServer } from './mocks/server/glip/MockGlipServer';
import { InstanceManager } from './mocks/server/InstanceManager';
// import { CommonFileServer } from './mocks/server/CommonFileServer';
import { GlipDataHelper } from './mocks/server/glip/data/data';
import { InitialData, GlipData } from './mocks/server/glip/types';
import { createDebug } from 'sdk/__tests__/utils';
const debug = createDebug('SdkItFramework');
import _ from 'lodash';
import assert = require('assert');
import { parseState } from './mocks/server/glip/utils';
import { blockExternalRequest } from './utils/network/blockExternalRequest';
import { IRequestResponse } from './utils/network/networkDataTool';
import { ProxyServer } from './mocks/server/ProxyServer';
import { IBaseResponse, IApi } from './types';

blockExternalRequest();

function readJson<
  A extends IApi<any, any> = IApi<any, any>,
  ReqData = A extends IApi<infer B, any> ? B : any,
  ResData = A extends IApi<any, infer B> ? B : any
>(json: IRequestResponse<ReqData, ResData>) {
  ['path', 'method', 'request', 'response'].forEach(k =>
    assert(json[k], `json lack of property[${k}]`),
  );
  return json;
}

function createRequestResponse<T>(
  options: {
    host: string;
    method: string;
    path: string;
  },
  response: IBaseResponse<T>,
) {
  return {
    response,
    request: {
      method: options.method,
    },
    hostAlias: options.host,
    method: options.method,
    path: options.path,
  } as IRequestResponse<any, T>;
}

type MockResponse = <
  A extends IApi<any, any> = IApi<any, any>,
  ReqData = A extends IApi<infer B, any> ? B : any,
  ResData = A extends IApi<any, infer B> ? B : any,
  T extends (api: IApi<ReqData, ResData>) => any = (
    api: IApi<ReqData, ResData>,
  ) => any
>(
  requestResponse: IRequestResponse<ReqData, ResData>,
  extractor?: T,
) => ReturnType<T>;

type ItContext = {
  currentUserId: () => number;
  currentCompanyId: () => number;
  mockResponse: MockResponse;
  readJson: typeof readJson;
  createRequestResponse: typeof createRequestResponse;
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
      const requestResponsePool: IRequestResponse[] = [];
      jest
        .spyOn(proxyServer, 'getRequestResponsePool')
        .mockImplementation(() => requestResponsePool);
    }
    const extractResult = extractor
      ? extractor(requestResponse)
      : requestResponse;
    const pool = proxyServer.getRequestResponsePool();
    pool.push(requestResponse);
    return extractResult;
  };

  // provide for it case to mock data.
  const itCtx: ItContext = {
    mockResponse,
    createRequestResponse,
    readJson,
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
