/*
 * @Author: James.Xie
 * @Date: 2018-08-13 16:20:17
 * Copyright © RingCentral. All rights reserved.
 */

import * as assert from 'assert';
import { AccountLockApi, AccountLockAcquire } from 'glip-account-pool-client';

import { ENV, DEBUG } from '../config';
interface IAccountPoolClient {
  baseUrl: string;
  envName: string;
  checkOutAccounts(accountType: string): Promise<any>;
  checkInAccounts(data: any): Promise<any>;
}

class AccountPoolClient implements IAccountPoolClient {
  accountLockApi: AccountLockApi;

  constructor(public baseUrl: string, public envName: string) {
    this.accountLockApi = new AccountLockApi(this.baseUrl);
  }

  async checkOutAccounts(accountType: string) {
    this.accountLockApi.basePath = this.baseUrl;
    const accountLockAcquireBody = new AccountLockAcquire();
    accountLockAcquireBody.envName = this.envName;
    accountLockAcquireBody.accountType = accountType;
    const acquiredAccount = await this.accountLockApi.accountLocksPost(
      accountLockAcquireBody,
    );
    return acquiredAccount.body;
  }

  async checkInAccounts(data: any) {
    const res = await this.accountLockApi.accountLocksAccountLockIdDelete(
      data.accountLockId,
    );
    return res.body;
  }
}

class AccountPoolManager implements IAccountPoolClient {
  availableAccounts: any;
  allAccounts: any[];
  baseUrl: string;
  envName: string;

  constructor(private accountPoolClient: IAccountPoolClient) {
    this.baseUrl = accountPoolClient.baseUrl;
    this.envName = accountPoolClient.envName;
    this.availableAccounts = {};
    this.allAccounts = [];
  }

  async checkOutAccounts(accountType: string) {
    if (this.availableAccounts[accountType] === undefined) {
      this.availableAccounts[accountType] = [];
    }
    const fifo: any[] = this.availableAccounts[accountType];
    if (fifo.length > 0) {
      return fifo.shift();
    }
    const data = await this.accountPoolClient.checkOutAccounts(accountType);
    this.allAccounts.push(data);
    return data;
  }

  async checkInAccounts(data: any) {
    assert(this.availableAccounts[data.accountType] !== undefined);
    this.availableAccounts[data.accountType].push(data);
  }

  async checkInAll() {
    for (const data of this.allAccounts) {
      const ret = await this.accountPoolClient.checkInAccounts(data);
      console.log(
        `Account Pool: success to reclaim account: ${data.companyEmailDomain}`,
      );
    }
  }
}

const _accountPoolUrl = DEBUG
  ? ENV.ACCOUNT_POOL_FOR_DEBUG_BASE_URL
  : ENV.ACCOUNT_POOL_BASE_URL;
const _accountPoolClient = new AccountPoolClient(
  _accountPoolUrl,
  ENV.ACCOUNT_POOL_ENV,
);
const accountPoolClient = new AccountPoolManager(_accountPoolClient);

// ensure account release on exit
const events: { name; exitCode }[] = [
  { name: 'beforeExit', exitCode: 0 },
  { name: 'uncaughtException', exitCode: 1 },
  { name: 'SIGINT', exitCode: 130 },
  { name: 'SIGTERM', exitCode: 143 },
];

events.forEach(e => {
  process.on(e.name, () => {
    console.log('start to release account');
    accountPoolClient
      .checkInAll()
      .then(() => {
        process.exit(e.exitCode);
      })
      .catch(err => {
        process.exit(e.exitCode);
      });
  });
});

export { accountPoolClient };
