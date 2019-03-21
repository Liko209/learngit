import { Container } from 'foundation';
import { AccountManager } from '../AccountManager';
import {
  IAuthenticator,
  ISyncAuthenticator,
  IAuthResponse,
  IAuthParams,
} from '../IAuthenticator';
import { AbstractAccount } from '../AbstractAccount';
import * as helper from '../helper';
import * as dao from '../../../dao';
import { NewGlobalConfig } from '../../../service/config/NewGlobalConfig';

jest.mock('../../../service/config/NewGlobalConfig');
class MyAccount extends AbstractAccount {
  async updateSupportedServices(data: any): Promise<void> {}
}

class MyOtherAccount extends AbstractAccount {
  async updateSupportedServices(data: any): Promise<void> {}
}

class MyAuthenticator implements IAuthenticator {
  authenticate(param: IAuthParams): Promise<IAuthResponse> {
    throw new Error('MyAuthenticator have been override by jest.fn()');
  }
}

class MySyncAuthenticator implements ISyncAuthenticator {
  authenticate(param: IAuthParams): IAuthResponse {
    throw new Error('MySyncAuthenticator have been override by jest.fn()');
  }
}

const mockAuthenticate = jest.fn();
const mockSyncAuthenticate = jest.fn();
MyAuthenticator.prototype.authenticate = mockAuthenticate;
MySyncAuthenticator.prototype.authenticate = mockSyncAuthenticate;

function setup() {
  const container = new Container({ singleton: true });

  container.registerClass({
    name: MyAccount.name,
    value: MyAccount,
  });

  container.registerClass({
    name: MyOtherAccount.name,
    value: MyOtherAccount,
  });

  container.registerClass({
    name: MyAuthenticator.name,
    value: MyAuthenticator,
  });

  container.registerClass({
    name: MySyncAuthenticator.name,
    value: MySyncAuthenticator,
  });

  const accountManager = new AccountManager(container);
  return { accountManager, container };
}

async function setupLoginSuccess() {
  const { container, accountManager } = setup();
  mockSyncAuthenticate.mockReturnValue({
    success: true,
    accountInfos: [
      { type: MyAccount.name, data: 'token' },
      { type: MyOtherAccount.name, data: 'other token' },
    ],
  });
  await accountManager.syncLogin(MySyncAuthenticator.name);
  const account = accountManager.getAccount(MyAccount.name);
  const otherAccount = accountManager.getAccount(MyOtherAccount.name);
  return { accountManager, account, otherAccount, container };
}

describe('AccountManager', () => {
  let accountManager: AccountManager;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('syncLogin()', () => {
    describe('when success', () => {
      beforeEach(() => {
        ({ accountManager } = setup());
        mockSyncAuthenticate.mockReturnValue({
          success: true,
          accountInfos: [{ type: MyAccount.name, data: 'token' }],
        });
        jest.spyOn(helper, 'fetchWhiteList').mockResolvedValue({});
      });

      it('should emit login event', async () => {
        const mockFn = jest.fn();
        accountManager.on(AccountManager.AUTH_SUCCESS, mockFn);
        await accountManager.syncLogin(MySyncAuthenticator.name);
        expect(mockFn).toHaveBeenCalled();
      });

      it('should return successful response', async () => {
        const resp = await accountManager.syncLogin(MySyncAuthenticator.name);
        expect(resp.success).toBeTruthy();
      });
    });

    describe('when failed', () => {
      beforeEach(() => {
        ({ accountManager } = setup());
        mockSyncAuthenticate.mockReturnValue({ success: false });
      });

      it('should return failed response', async () => {
        const resp = await accountManager.syncLogin(MySyncAuthenticator.name);
        expect(resp.success).toBeFalsy();
      });
    });
  });

  describe('login()', () => {
    it('should work', async () => {
      mockAuthenticate.mockReturnValue({
        success: true,
        accountInfos: [{ type: MyAccount.name, data: 'token' }],
      });
      await accountManager.login(MyAuthenticator.name);
    });
  });

  describe('logout()', () => {
    it('should emit logout event', async () => {
      const mockFn = jest.fn();
      accountManager.on(AccountManager.EVENT_LOGOUT, mockFn);
      await accountManager.logout();
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('getAccount()', () => {
    it('should return null when account not existed', () => {
      const { accountManager } = setup();
      const account = accountManager.getAccount(MyAccount.name);
      expect(account).toBeNull();
    });

    it('should return a account instance', async () => {
      const { accountManager } = await setupLoginSuccess();
      const account = accountManager.getAccount(MyAccount.name);
      expect(account).toBeInstanceOf(MyAccount);
    });
  });

  describe('hasAccount()', () => {
    it('should return false when the account not existed', () => {
      expect(accountManager.hasAccount(MyAccount.name)).toBeFalsy();
    });
  });

  describe('updateSupportedServices()', () => {
    it("should invoke all account's updateSupportedServices ", async () => {
      const {
        accountManager,
        account,
        otherAccount,
      } = await setupLoginSuccess();
      jest.spyOn(account, 'updateSupportedServices');
      jest.spyOn(otherAccount, 'updateSupportedServices');

      accountManager.updateSupportedServices();

      expect(account.updateSupportedServices).toHaveBeenCalled();
      expect(otherAccount.updateSupportedServices).toHaveBeenCalled();
    });
  });

  describe('isLoggedInFor()', () => {
    it('should return true when already logged in', async () => {
      const { accountManager } = await setupLoginSuccess();

      expect(accountManager.isLoggedInFor(MyAccount.name)).toBeTruthy();
    });
  });

  describe('isLoggedIn()', () => {
    it('should return true when already logged in', async () => {
      const { accountManager } = await setupLoginSuccess();

      expect(accountManager.isLoggedIn()).toBeTruthy();
    });
  });

  describe('getSupportedServices()', () => {
    it('should get supported services from accounts', async () => {
      const {
        account,
        otherAccount,
        accountManager,
      } = await setupLoginSuccess();
      jest.spyOn(account, 'getSupportedServices').mockReturnValue(['AService']);
      jest
        .spyOn(otherAccount, 'getSupportedServices')
        .mockReturnValue(['BService']);

      const services = accountManager.getSupportedServices();

      expect(services).toEqual(['AService', 'BService']);
    });
  });

  describe('isSupportedService()', () => {
    it('should get supported services from accounts', async () => {
      const { accountManager, account } = await setupLoginSuccess();
      jest.spyOn(account, 'getSupportedServices').mockReturnValue(['AService']);

      expect(accountManager.isSupportedService('AService')).toBeTruthy();
    });
  });
  describe('sanitizeUser()', () => {
    const mockedConfigDao = {
      getEnv: jest.fn().mockReturnValue('release'),
    };
    const mockedAccountInfo = [
      {
        type: 'RC',
        data: {
          owner_id: '110',
        },
      },
    ];
    const accountManager = new AccountManager(null);
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(dao.daoManager, 'getKVDao').mockImplementation(() => {
        return mockedConfigDao;
      });
    });
    it('should be valid user when the env is not restricted in the white list [JPT-631]', async () => {
      jest.spyOn(helper, 'fetchWhiteList').mockResolvedValue({
        Chris_sandbox: [],
      });
      const permitted = await accountManager.sanitizeUser(
        mockedAccountInfo[0].data.owner_id,
      );
      expect(permitted).toBeTruthy();
    });
    it('should be valid user when the user is in the white list [JPT-631]', async () => {
      jest.spyOn(helper, 'fetchWhiteList').mockResolvedValue({
        release: ['110'],
      });
      const permitted = await accountManager.sanitizeUser(
        mockedAccountInfo[0].data.owner_id,
      );
      expect(permitted).toBeTruthy();
    });
    it('should be invalid user when the user is not in the white list [JPT-639]', async () => {
      jest.spyOn(helper, 'fetchWhiteList').mockResolvedValue({
        release: ['123'],
      });

      NewGlobalConfig.getEnv = jest.fn().mockReturnValue('release');
      const permitted = await accountManager.sanitizeUser(mockedAccountInfo);

      expect(permitted).toBeFalsy();
    });
  });
});
