/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 14:56:33
 * Copyright © RingCentral. All rights reserved
*/

import { IAccount, AccountManager } from '..';
import { TestAccount, TestAuthenticator } from '../__mocks__/accounts/TestAccount';
import TestService from '../__mocks__/services/TestService';
import { Container } from '../Container';

function setup() {
  const container = new Container();
  const accountManager = new AccountManager(container);

  container.registerAll([
    {
      name: TestService.name,
      value: TestService,
      singleton: true
    },
    {
      name: TestAuthenticator.name,
      value: TestAuthenticator,
      singleton: true
    },
    {
      name: TestAccount.name,
      value: TestAccount,
      singleton: true
    }
  ]);

  return { accountManager };
}

async function setupAndLogin() {
  const { accountManager } = setup();
  const { accounts } = await accountManager.login(TestAuthenticator.name, {
    username: '123',
    password: '123'
  });
  return { accountManager, accounts };
}

describe('AccountManager', () => {
  describe('isLoggedIn()', () => {
    it('isLoggedIn()', () => {
      const { accountManager } = setup();
      expect(accountManager.isLoggedIn()).toBeFalsy();
    });
  });

  describe('isLoggedInFor()', () => {
    it('should defaults to be false', () => {
      const { accountManager } = setup();
      expect(accountManager.isLoggedInFor(TestAccount.name)).toBeFalsy();
    });

    it('should be true if some account was provisioned', async () => {
      const { accountManager } = setup();
      await accountManager.login(TestAuthenticator.name, {
        username: '123',
        password: '123'
      });
      expect(accountManager.isLoggedInFor(TestAccount.name)).toBeTruthy();
    });
  });

  describe('getAccount()', () => {
    it('should return account', async () => {
      const { accountManager } = await setupAndLogin();
      let account: IAccount = accountManager.getAccount(TestAccount.name);
      expect(account).toBeInstanceOf(TestAccount);
    });

    it('should return null when account type not exist', () => {
      const { accountManager } = setup();
      const account = accountManager.getAccount('NULL');
      expect(account).toBeNull();
    });
  });

  describe('getSupportedServices()', () => {
    it('should return supported services', () => {
      const { accountManager } = setup();
      const services = accountManager.getSupportedServices();
      expect(services).toEqual([]);
    });
  });

  describe('login()', () => {
    let resp: any;
    let accountManager: AccountManager;

    describe('when login success', () => {
      beforeAll(async () => {
        ({ accountManager } = setup());
        jest.spyOn(accountManager, 'emit');
        resp = await accountManager.login(TestAuthenticator.name, {
          username: '123',
          password: '123'
        });
      });

      it('should return successful response', () => {
        expect(resp.success).toBeTruthy();
        expect(resp.data).not.toBeNull();
      });

      it('should set isLoggedIn to true', () => {
        expect(accountManager.isLoggedIn()).toBeTruthy();
      });

      it('should emit login event with accountInfos', () => {
        expect(accountManager.emit).toHaveBeenCalledWith(AccountManager.EVENT_LOGIN, [
          { data: 'demo_access_token', type: 'TestAccount' }
        ]);
      });
    });

    describe('when login fail', () => {
      beforeAll(async () => {
        ({ accountManager } = setup());
        jest.spyOn(accountManager, 'emit');

        resp = await accountManager.login(TestAuthenticator.name, {
          username: '123',
          password: 'wrong password'
        });
      });

      it('should return failed response', () => {
        expect(resp.success).toBeFalsy();
        expect(resp.error).toBeInstanceOf(Error);
      });

      it('should set isLoggedIn to false', () => {
        expect(accountManager.isLoggedIn()).toBeFalsy();
      });
    });
  });

  describe('logout()', () => {
    let accountManager: AccountManager;

    beforeAll(async () => {
      ({ accountManager } = setup());
      await accountManager.logout();
    });

    it('should logout', async () => {
      expect(accountManager.isLoggedIn()).toBeFalsy();
    });

    it('should stop all services', async () => {
      expect(accountManager.getSupportedServices()).toEqual([]);
    });
  });
});
