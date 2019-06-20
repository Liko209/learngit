import { Sdk } from 'sdk/index';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { notificationCenter } from 'sdk/service';
import { MockGlipServer } from './mockServer/glip/MockGlipServer';
import { InstanceManager } from './mockServer/InstanceManager';
import { CommonFileServer } from './mockServer/CommonFileServer';
import { spyOnTarget } from './utils';
import { InitialData } from './mockServer/glip/types';

type ItContext = {
  data: {
    useInitialData: (initialData: InitialData) => void;
  };
  server: {
    glip: MockGlipServer;
    rc: {};
  };
};

type LifeCycleHooks = {
  beforeAll: jest.Lifecycle;
  beforeEach: jest.Lifecycle;
  afterAll: jest.Lifecycle;
  afterEach: jest.Lifecycle;
};

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
  const startTime = Date.now();
  await initSdk();
  login();
  await initEnd();
  console.log('setup sdk cost:', Date.now() - startTime);
}

export function itForSdk(
  name: string,
  caseExecutor: (itCtx: ItContext) => void,
) {
  console.log('framework init...');

  const fileServer = InstanceManager.get(CommonFileServer);
  const mockGlipServer = InstanceManager.get(MockGlipServer);
  const useInitialData = (initialData: InitialData) => {
    mockGlipServer.applyInitialData(initialData);
  };
  // provide for it case to mock data.
  const itCtx: ItContext = {
    data: {
      useInitialData,
    },
    server: {
      // inject mock server here
      glip: mockGlipServer,
      rc: {},
    },
  };

  beforeAll(async () => {
    const startTime = Date.now();
    console.log('framework beforeAll');
    await setup();
    console.log('framework beforeAll cost:', Date.now() - startTime);
  });

  afterAll(async () => {
    console.log('framework afterAll');
    clearMocks();
    const startTime = Date.now();
    await ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).logout();
    console.log('clean sdk cost:', Date.now() - startTime);
  });
  describe(name, () => {
    caseExecutor(itCtx);
  });
}
