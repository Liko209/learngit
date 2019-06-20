import { Sdk } from 'sdk/index';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { notificationCenter } from 'sdk/service';
import { MockGlipServer } from './mockServer/glip/MockGlipServer';
import { InstanceManager } from './mockServer/InstanceManager';
import { CommonFileServer } from './mockServer/CommonFileServer';
import { spyOnTarget } from './utils';
import { InitialData } from './mockServer/glip/types';
import _debug from 'debug';
const debug = _debug('SdkItFramework');
debug['useColors'] = true;
debug.enabled = true;

type ItContext = {
  data: {
    useInitialData: (initialData: InitialData) => void;
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
    sdk: {
      setup,
      cleanUp,
    },
  };
  describe(name, () => {
    caseExecutor(itCtx);
  });
}
