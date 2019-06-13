import { Sdk } from 'sdk/index';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { notificationCenter } from 'sdk/service';
import './ItUtils';

jest.mock('sdk/utils/phoneParser');
jest.mock('sdk/framework/account/helper', () => {
  return {
    fetchWhiteList: jest.fn().mockReturnValue({}),
  };
});
jest.mock('foundation/src/network/client/http/Http');
jest.mock('foundation/src/network/client/socket/Socket');

type ItContext = {
  server: {
    glip: {};
    rc: {};
  };
  models: {
    post: {};
  };
};

type LifeCycleHooks = {
  beforeAll: jest.Lifecycle;
  beforeEach: jest.Lifecycle;
  afterAll: jest.Lifecycle;
  afterEach: jest.Lifecycle;
};

function executeHooks<N extends keyof LifeCycleHooks>(
  name: N,
  hooks?: Partial<LifeCycleHooks>,
  ...args: any
) {
  if (hooks && hooks[name]) {
    hooks[name]!.call(null, ...args);
  }
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
    notificationCenter.once('---l---', () => resolve());
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
  const itCtx: ItContext = {
    server: {
      // create mock server here
      glip: {},
      rc: {},
    },
    models: {
      post: {},
    },
  };

  beforeAll(async () => {
    console.log('framework beforeAll');
    clearMocks();
    await setup();
  });
  afterAll(async () => {
    console.log('framework afterAll');
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
