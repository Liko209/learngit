import { Sdk } from 'sdk/index';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { notificationCenter } from 'sdk/service';
import { MockGlipServer } from './mockServer/glip/MockGlipServer';
import { InstanceManager } from './mockServer/InstanceManager';
import { CommonFileServer } from './mockServer/CommonFileServer';
import { GlipDataHelper } from './mockServer/glip/data/data';
import { spyOnTarget } from './utils';
import { InitialData, GlipData } from './mockServer/glip/types';
import { createDebug } from 'sdk/__tests__/utils';
import _ from 'lodash';
import assert = require('assert');
const debug = createDebug('SdkItFramework');

type ItContext = {
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

type LifeCycleHooks = {
  beforeAll: jest.Lifecycle;
  beforeEach: jest.Lifecycle;
  afterAll: jest.Lifecycle;
  afterEach: jest.Lifecycle;
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
  const result: GlipData = {
    company,
    user,
    people: initialData.people,
    groups: initialData.groups,
    teams: initialData.teams,
    clientConfig: initialData.client_config,
    state: initialData.state,
    // todo parse to groupState
    // groupState: initialData.
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
  const fileServer = InstanceManager.get(CommonFileServer);
  const mockGlipServer = InstanceManager.get(MockGlipServer);
  const useAccount = (companyId: number, userId: number) => {
    return new GlipDataHelper(companyId, userId);
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

  // provide for it case to mock data.
  const itCtx: ItContext = {
    data: {
      useInitialData,
      helper,
      apply,
      template: {
        BASIC: require('./mockServer/glip/data/template/accountData/empty-account.json'),
        STANDARD: require('./mockServer/glip/data/template/accountData/empty-account.json'),
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
