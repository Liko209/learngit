import { Sdk, sdk } from 'sdk/index';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { notificationCenter } from 'sdk/service';

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

// function withHooks<N extends keyof LifeCycleHooks>(name: N, hooks?: Partial<LifeCycleHooks>) {
//   const
//   return (callback: jest.ProvidesCallback, timeOut?: number) => {

//   }
// }

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
  console.log('-=======setup start', startTime);
  await initSdk();
  login();
  await initEnd();
  console.log('-=======end', Date.now(), 'cost:', Date.now() - startTime);
}

export function itForSdk(name: string, hooks?: Partial<LifeCycleHooks>) {
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
  return function run(caseExecutor: (itCtx: ItContext) => void) {
    console.log('framework init...');

    beforeAll(async () => {
      clearMocks();
      await setup();
    });
    afterAll(async () => {
      const startTime = Date.now();
      console.log('-=======afterAll start', startTime);
      await ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).logout();
      console.log(
        '-=======afterAll end',
        Date.now(),
        'cost:',
        Date.now() - startTime,
      );
    });
    beforeEach((...args: any) => {
      console.log('framework beforeEach');
      executeHooks('beforeEach', hooks, ...args);
    });
    afterEach((...args: any) => {
      console.log('framework afterEach');
      executeHooks('afterEach', hooks, ...args);
    });
    describe(name, () => {
      caseExecutor(itCtx);
    });
  };
}
